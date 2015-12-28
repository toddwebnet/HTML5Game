/**********************************************
 * adamDisplay.js
 * Manages an Adam display (TV-based display). 
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   9/17/2014   Initial version
 **********************************************/

"use strict";

var _applicationVersion;
var _logMessages = true; /* defaults to true, but will be overlayed with config value */
var _mode = -1;
var _zoneConfigXml;
var _themeConfigXml;

var _currentChannelSubtitleIndex;
var _reportInInterval;
var _server;
var _listenPort;
var _sendPort;
var _vidX;
var _vidY;
var _vidW;
var _vidH;
var _pigX;
var _pigY;
var _pigW;
var _pigH;
var _gpPigX;
var _gpPigY;
var _gpPigW;
var _gpPigH;

var _welcomeVideoURL;
var _welcomeVideoMedia;
var _welcomeVideoPlaying = false;
var _welcomeVideoShutdownInProgress = false;
var _welcomeVideoAlreadyPlayed = false;
var _internetPopup = false;
var _marketingPopupSeen = false;

var _startUpCounter = -1; /* counts up the first ten seconds of the application's life */
var _inContextCounter = -1 /* counts the first ten seconds in the current context */
var _stbWelcomeVideoDelay;

var display;
var displayStructure;
var menu;
var nav;
var context;
var channelGuide;
var pms;
var survey;
var weather;
var compendium;

function trace( logData ) {
	console.log(logData);
  return;
}

   
$( document ).ready( function( ) {
   trace( "Document ready" );
   
   /* deploy.php will modify this next line based on TV/NonTV designation. Please don't change it */
   display = new HcapDisplay( );
   display.muteVideo( );

   displayStructure = new DisplayStructure( );
   
   menu = new Menu( );
   
   nav = new Navigation( );
   nav.initialize( );

   context = new Context( );
   context.initialize( );
   channelGuide = new ChannelGuide( );
   channelGuide.initialize( );

   pms = new PMS( );

   survey = new Survey( );
   weather = new Weather( );
	 
	
   displayStructure.build( ); /* build out the divs for this page */
   getTime( );
   
   display.initialize( );
   display.property.theme = "theme/marriottTopo01"; /* the deploy app will modify this. Please don't change it */
	 
	 compendium = new Compendium(display.property.theme);	 
	 //compendium.initialize(display.property.theme);

   loadConfig( );

   /* run any zone-specific customizations */
   if ( typeof customInitialization === "function" ) {
      customInitialization( );
   }
});

function handleIncomingTCP( xml ) {

   var xmlSerialNumber;
   var dataType;
   var result = '';
   $( xml ).find( "dataType" ).each( function( ) {
      dataType = $( this ).text( );
   });
   switch ( dataType ) {
      case "CHANNEL_CHANGE" :
				var NewChannel;
         $( xml ).find("logicalChannel").each( function( ) {
					 logMessage("here");
						NewChannel = $( this ).text(); 
					});	
					NewChannel = parseInt(NewChannel);
					logMessage( "Received CHANNEL_CHANGE: " + NewChannel);		 
				 display.gotoChannel(NewChannel);
         break;
			case "PMS_DATA" :
         pms.setPMSData( xml );
         break;
      case "INCOMING_KEY" :
	     var testKey;
         logMessage( "Received INCOMING_KEY ");		 
					$( xml ).find("key").each( function( ) {
						testKey = parseInt( $( this ).text() )  
					});
					hcap.key.sendKey({
					"virtualKeycode":testKey,
					"onSuccess":function() {
						logMessage("onSuccess: Key received: " + testKey );
						}, 
					"onFailure":function(f) {
						logMessage("onFailure : errorMessage = " + f.errorMessage);
						}
					});	
         break;
      case "WEATHER_DATA" :
         weather.setWeatherData( xml );
         break;
      case "CURRENT_TIME" :
         var year;
         var month;
         var day;
         var hour;
         var minute;
         var second;
         var gmtOffsetMinutes;
         var isDst;

         $( xml ).find( "year" ).each( function( ) {
            year = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "month" ).each( function( ) {
            month = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "day" ).each( function( ) {
            day = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "hour" ).each( function( ) {
            hour = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "minute" ).each( function( ) {
            minute = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "second" ).each( function( ) {
            second = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "gmtOffsetMinutes" ).each( function( ) {
            gmtOffsetMinutes = parseInt( $( this ).text( ) );
         });
         $( xml ).find( "isDST" ).each( function( ) {
            isDst = parseInt( $( this ).text( ) );
            isDst = ( isDst == 1 ? true : false ); /* must be a boolean type */
         });

         /* compare to current time and set if we're off by 30 seconds or more */
         var serverTime = moment( { year: year, month: month-1, day: day, hour: hour, minute: minute, second: second, millisecond: 0 } );
         var localTime = moment( );

         var timeDiff =  serverTime.diff( localTime, "seconds" );

         if ( Math.abs( timeDiff ) > 30 ) {
            display.setTime( year, month, day, hour, minute, second, gmtOffsetMinutes, isDst );
         }
      
         break;
      case "SET_ROOM_NUMBER" :
         /* TODO - Should move this code somewhere central since it's used multiple places */
         $( xml ).find( "serialNumber" ).each( function( ) {
            xmlSerialNumber = $( this ).text( );
            /* validate the serial number against this unit's serial number */
            if ( xmlSerialNumber == display.property.serialNumber ) {
               $( xml ).find( "roomNumber" ).each( function( ) {
                  var roomNumber= $( this ).text( );
                  display.setRoomNumber( roomNumber );
               });
            }
            else {
               logMessage( "Room number request: serial number does not match the current serial number: " + xmlSerialNumber + " vs. " + display.property.serialNumber );
            }
         });
         break;
      case "CHECK_OUT" :
         /* clears PMS data, and checks out device */
         $( xml ).find( "serialNumber" ).each( function( ) {
            xmlSerialNumber = $( this ).text( );
            /* validate the serial number against this unit's serial number */
            if ( xmlSerialNumber == display.property.serialNumber ) {
               pms.clearPMSData( );
               display.checkOut( );
            }
            else {
               logMessage( "Check out request: serial number does not match the current serial number: " + xmlSerialNumber + " vs. " + display.property.serialNumber );
            }
         });

         break;
      
      case "TEST" :
         logMessage( "Test Called!" );
         var scripts = document.getElementsByTagName("script"),
         src = scripts[scripts.length-1].src;
         logMessage( "Test" + src);
         hcap.preloadedApplication.getPreloadedApplicationList({
            "onSuccess":function(s) {
               logMessage( "Test Called2!" );
               for (var i = 0; i < s.list.length; i++) {
                  logMessage( "list[" + i + "].id = " + s.list[i].id + "list[" + i + "].title = " + s.list[i].title + "list[" + i + "].iconFilePath = " + s.list[i].iconFilePath);
               }
            },
            "onFailure":function(f) {
               logMessage( "Test Failed!" );
            }
         });
         break;
   }
}

function setWelcomeMessage( welcomeMessage, onlyIfBlank ) {
   if ( onlyIfBlank ) {
      if ( $( "#welcomeText" ).html( ) == '' ) {
         $( "#welcomeText" ).html( welcomeMessage );
      }
   }
   else { /* always replace */
      $( "#welcomeText" ).html( welcomeMessage );
   }
}

/* send information about this client to the listener on the server */
/* it is assumed this information has already been gathered */
function reportIn( ) {
   /* make sure the major data items are defined before reporting in */
   if (    display.property.ipAddress != undefined 
        && display.property.serialNumber != undefined 
        && display.property.modelName!= undefined 
      ) {
      var reportInData = 
                "<clientData>"
              + "<dataType>REPORT_IN</dataType>"
              + "<ipAddress>" + display.property.ipAddress + "</ipAddress>"
              + "<roomNumber>" + display.property.roomNumber + "</roomNumber>"
              + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
              + "<modelName>" + display.property.modelName+ "</modelName>"
              + "<appVersion>" + _applicationVersion + "</appVersion>"
              + "<hcapJsExtensionVersion>" + display.property.hcapJsExtensionVersion + "</hcapJsExtensionVersion>"
              + "<hcapMiddlewareVersion>" + display.property.hcapMiddlewareVersion + "</hcapMiddlewareVersion>"
              + "<platformManufacturer>" + display.property.platformManufacturer + "</platformManufacturer>"
              + "<platformVersion>" + display.property.platformVersion + "</platformVersion>"
              + "<ptcVersion>" + display.property.ptcVersion + "</ptcVersion>"
              + "<hardwareVersion>" + display.property.hardwareVersion + "</hardwareVersion>"
              + "<bootVersion>" + display.property.bootVersion + "</bootVersion>"
              + "<minGuideDataStartTime>" + channelGuide.convertGuideTimeToDBTimeStr( channelGuide.minGuideDataStartTime ) + "</minGuideDataStartTime>"
              + "<maxGuideDataEndTime>" + channelGuide.convertGuideTimeToDBTimeStr( channelGuide.maxGuideDataEndTime ) + "</maxGuideDataEndTime>"
              + "</clientData>";

      display.sendData( reportInData );
   
      /* make another request in the designated timeframe */
      if ( _reportInInterval != undefined ) {
         setTimeout( function( ) { reportIn( ); }, _reportInInterval );
      }
   }
   else { 
         logMessage( "REPORT_IN - ip, serial or model still blank. Will try to report in again in a second" );
         /* try again in a second */
         setTimeout( function( ) { reportIn( ); }, 1000 );
   }
}

function reportPowerUp( ) {
   /* if the data elements needed are defined, report the power up, else try again after a short interval */
   if (    display.property.ipAddress != undefined 
        && display.property.serialNumber != undefined 
      ) {
      display.sendData( "<clientData>"
                      + "<dataType>POWER_UP</dataType>"
                      + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                      + "</clientData>" );
   }
   else {
      setTimeout( function( ) { reportPowerUp( ); }, 250 );
   }
}

function reportPowerDown( ) {
   if ( display.property.serialNumber != undefined ) {
      display.sendData( "<clientData>"
                      + "<dataType>POWER_DOWN</dataType>"
                      + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                      + "</clientData>" );
      }
}

function logMessage( message ) {

	if ( !_logMessages ) { return; }
	if(typeof hcap === 'undefined')
	{
		console.log("LOG: " +  message);
	}
	else
	{
		display.sendData( "<clientData>"
										+ "<dataType>LOG</dataType>"
										+ "<message>" + message + "</message>"
										+ "</clientData>" );
	}
}


function initializePigVideo( ) {
   display.setVideoAttributes( _pigX, _pigY, _pigW, _pigH );
}

function initializeGuideVideo( ) {
   display.setVideoAttributes( _gpPigX, _gpPigY, _gpPigW, _gpPigH );
}
function initializeNullVideo( ) {
   display.setVideoAttributes( 0, 0, 0, 0 );
}

/* if navItem is passed in, once context is switched go to that navItem */

function getTime() {
   var m = moment( );

   $( "#timeAndDate" ).html( m.format( channelGuide.timeDisplayFormat ) );
	 if($("#timeAndDate2").length)
		{$("#timeAndDate2").html($("#timeAndDate").html());}

   $( "#channelBannerTime" ).html( m.format( channelGuide.timeDisplayFormat ) );
   var t = setTimeout( function( ) { getTime() }, 1000 );

   /* check for need to refresh channel guide if we're at a boundary */
   var diff = m.minute( ) % channelGuide.channelGuideTimeIncrementMinutes;
   if ( diff == 0 ) { /* rebuild if the time at the top of the guide is different than current time */
      if ( m.format( channelGuide.timeDisplayFormat ) != $( "#channelGuideTime01" ).html( ) ) {
         /* rebuild */
         channelGuide.build( m.format( channelGuide.guideTimeInternalFormat ) );
      }
   }

   if ( _startUpCounter < 10 ) {
      _startUpCounter++;
   }
   if ( _inContextCounter < 10 ) {
      _inContextCounter++;
   }
}

function padZero( i ) {
    if ( i < 10 ) { i = "0" + i };  /* add zero in front of numbers < 10 */
    return i;
}

function loadConfig( ) {
   $.ajax( {
      type: "GET",
      url: "zone/marriott/zoneConfig.xml",
      dataType: "xml",
      success: function( xml ) {
         /* initialize configuration data and switch to the welcome screen */
         _zoneConfigXml = xml;
         $.ajax( {
            type: "GET",
            url: "theme/marriottTopo01/themeConfig.xml",
            dataType: "xml",
            success: function( xml ) {
               trace( "Zone config loaded" );
               _themeConfigXml = xml;
               gatherGeneralConfigValues( );
               $( "#version" ).html( _applicationVersion );
               display.setupEvents( );
               menu.buildAll( );
               display.loadApplications( );
               pms.initialize( );
               survey.initialize( );
               weather.initialize( );
      
               /* load channel lineups */
               $.ajax( {
                  type: "GET",
                  url: "zone/marriott/channelLineup.xml",
                  dataType: "xml",
                  success: function( xml ){
                     trace( "Channel lineup loaded" );
                     var channelLineupXml = xml;
                     /* once loaded, now load guide data */
                     $.ajax( {
                        type: "GET",
                        url: "zone/marriott/guideDataJSON.xml",
                        dataType: "xml",
                        success: function( xml ){
                           trace( "Guide data loaded" );
                           /* load guide data */
                           var guideDataXml = xml;
                           channelGuide.load( channelLineupXml, guideDataXml );
                           // Don't believe this is needed - already done in initialize
                           // getCurrentChannel( );
                        },
                        error: function( f ) {
                           logMessage( "Guide data xml does not exist: " + f.errorMessage );
                        }
                     } );
                  },
                  error: function( f ) {
                     logMessage( "Channel lineup xml does not exist: " + f.errorMessage );
                  }
               } );
            },
            error: function( f ) {
               logMessage( "Zone config xml does not exist: " + f.errorMessage );
            }
         });
      },
      error: function( ) {
         logMessage( "zoneConfig.xml does not exist" );
      }
   });
   trace( "Config load completed" );
}

function gatherGeneralConfigValues( ) {
   _applicationVersion = getZoneConfigValue( "applicationVersion" ) + " - " + display.property.theme;
   var logMessages = getZoneConfigValue( "logMessages" ).toUpperCase( );
   if ( logMessages == "N" || logMessages == "NO" || logMessages == "0" || logMessages == "FALSE" ) {
      _logMessages = false;
   }
   else {
      _logMessages = true;
   }
   _server = getZoneConfigValue( "server" );
   _reportInInterval = getZoneConfigValue( "reportInIntervalMs" );
   channelGuide.channelBannerDelay = parseInt( getThemeConfigValue( "channelBannerDelayMs", false ) );
   _stbWelcomeVideoDelay = parseInt( getThemeConfigValue( "STBWelcomeVideoDelayMs", false ) );
   _welcomeVideoURL = getThemeConfigValue( "welcomeVideoURL", false );
   _internetPopup = getThemeConfigValue( "internetPopup", false );
   var marketingSlogan = getThemeConfigValue( "marketingSlogan", false );
   if ( marketingSlogan ) {
      $( "#marketingArea" ).html( marketingSlogan ); 
   }
   _listenPort = parseInt( getZoneConfigValue( "listenPort" ) );
   _sendPort = parseInt( getZoneConfigValue( "sendPort" ) );
   _vidX = parseInt( getThemeConfigValue( "vid-x", false ) );
   _vidY = parseInt( getThemeConfigValue( "vid-y", false ) );
   _vidW = parseInt( getThemeConfigValue( "vid-w", false ) );
   _vidH = parseInt( getThemeConfigValue( "vid-h", false ) );
   _pigX = parseInt( getThemeConfigValue( "pig-x", false ) );
   _pigY = parseInt( getThemeConfigValue( "pig-y", false ) );
   _pigW = parseInt( getThemeConfigValue( "pig-w", false ) );
   _pigH = parseInt( getThemeConfigValue( "pig-h", false ) );
   _gpPigX = parseInt( getThemeConfigValue( "gpPig-x", false ) );
   _gpPigY = parseInt( getThemeConfigValue( "gpPig-y", false ) );
   _gpPigW = parseInt( getThemeConfigValue( "gpPig-w", false ) );
   _gpPigH = parseInt( getThemeConfigValue( "gpPig-h", false ) );

   /* gather guide data parameters */
   channelGuide.channelGuideDisplayedMinutes = parseInt( getThemeConfigValue( "channelGuideDisplayedMinutes", false ) );
   channelGuide.channelGuideDurationMinutes = parseInt( getThemeConfigValue( "channelGuideDurationMinutes", false ) );
   channelGuide.channelGuideChannels = parseInt( getThemeConfigValue( "channelGuideChannels", false ) );
   channelGuide.channelGuideTimeIncrementMinutes = parseInt( getThemeConfigValue( "channelGuideTimeIncrementMinutes", false ) );
   channelGuide.channelGuideCellSpacing = getThemeConfigValue( "channelGuideCellSpacing", false );
   
   /* load approved applications */
   display.property.application = new Array( );
   var currentIX;

   $( _zoneConfigXml ).find( "application" ).each( function( ) {
      var pseudoAppID = 1;
      var contextXML = this;
      $( contextXML ).find( "name" ).each( function( ) {
         display.property.application.push( { title: $( this ).text( )
                                      ,id: 0
                                      ,icon: '' 
                                      ,helperText: ''
                                      ,target: '' /* this is optional */
                                      ,url: ''    /* this is optional */
                                      ,browserApp: '' /* this is optional - required if url specified */
                                     }
                                   );
         currentIX = display.property.application.length - 1;
      });
      $( contextXML ).find( "helperText" ).each( function( ) {
         display.property.application[ currentIX ].helperText = $( this ).text( );
      });
      $( contextXML ).find( "icon" ).each( function( ) {
         if ( $( this ).text( ) > '' ) {
            display.property.application[ currentIX ].icon = displayStructure.imageFolder + $( this ).text( );
         }
      });
      $( contextXML ).find( "visible" ).each( function( ) {
         if ( $( this ).text( ) > '' ) {
            var visible = $( this ).text( ).toUpperCase( );
            visible = ( visible == "Y" || visible == "YES" || visible == "1" );
            display.property.application[ currentIX ].visible = visible;
         }
      });
      $( contextXML ).find( "target" ).each( function( ) {
         if ( $( this ).text( ) > '' ) {
            display.property.application[ currentIX ].target = $( this ).text( );
         }
      });
      $( contextXML ).find( "url" ).each( function( ) {
         if ( $( this ).text( ) > '' ) {
            display.property.application[ currentIX ].url = $( this ).text( );
         }
      });
      $( contextXML ).find( "browserApp" ).each( function( ) {
         if ( $( this ).text( ) > '' ) {
            display.property.application[ currentIX ].browserApp = $( this ).text( );
         }
      });

      if ( display.property.application[ currentIX ].target > '' ||
           display.property.application[ currentIX ].url > '' ) {

         /* set a pseudo ID so the app will show */
         display.property.application[ currentIX ].id = pseudoAppID++;
      }
   });
}

/* loads a zone-application configuration value */
function getZoneConfigValue( configName ) {

   var configValue;
   var contextXML;

   $( _zoneConfigXml ).find( configName ).each( function( ) {
      configValue = $( this ).text( );
   });

   return configValue;
}

/* loads a theme configuration value, optioally limited by the current context */
function getThemeConfigValue( configName, useContext ) {
   var configValue;
   var contextXML;

   if ( !useContext ) {
      $( _themeConfigXml ).find( configName ).each( function( ) {
         configValue = $( this ).text( );
      });
   }
   else {
      $( _themeConfigXml ).find( "context" ).each( function( ) {
         contextXML = this;
         $( contextXML ).find( "context-name" ).each( function( ) {
            if ( $( this ).text( ) == context.currentContext ) {
               $( contextXML ).find( configName ).each( function( ) {
                  configValue = $( this ).text( );
               });
            }
         });
      });
   }

   return configValue;
}

function getMenuImage( menuItemID ) {

   var configValue;
   var contextXML;

   $( _themeConfigXml ).find( "context" ).each( function( ) {
      contextXML = this;
      $( contextXML ).find( "context-name" ).each( function( ) {
         if ( $( this ).text( ) == context.currentContext ) {
            $( contextXML ).find( "item" ).each( function( ) {
               var itemXML = this;
               $( itemXML ).find( "id" ).each( function( ) {
                  if ( $( this ).text( ) == menuItemID ) {
                     $( itemXML ).find( "image" ).each( function( ) {
                        configValue = $( this ).text( );
                     });
                  }
               });
            });
         }
      });
   });

   return configValue;
}

function showSpinner( ) {
   //$( ".spinner" ).show( );
}

function hideSpinner( ) {
   //$( ".spinner" ).hide( );
}


// NEED TO REFACTOR
function getChannelSubtitleIndex( clear ) {
//   hcap.channel.getCurrentChannelSubtitleIndex({
//        "onSuccess":function(s) {
//            _currentChannelSubtitleIndex = s.index;
//            if ( clear ) { /* clear subtitles */
//               setChannelSubtitleIndex( 0 );
//            }
//
//         }, 
//        "onFailure":function(f) {
//            logMessage("Could not get channel subtitle index: errorMessage = " + f.errorMessage);   
//        }
//   });
}

// NEED TO REFACTOR
function setChannelSubtitleIndex( channelSubtitleIndex ) {
//   hcap.channel.setCurrentChannelSubtitleIndex({
//        "index": channelSubtitleIndex
//       ,"onSuccess":function() {
//        }
//       ,"onFailure":function(f) {
//            logMessage("Could not set channel subtitle index to " + channelSubtitleIndex + " : errorMessage = " + f.errorMessage);   
//        }
//   });
}

/*
function WelcomeVideoPopulateHTML(VideoPath)
{
	logMessage("######## WelcomeVideoPopulateHTML");	
	if ($('#welcomeVideo').length > 0) 
	{
		if($("#welcomeVideo").html().length==0)
		{
		  var strHTML = "<video id=\"objWelcomeVideo\" style=\"height: 100%; width: 100%\" loop><source src=\"" + VideoPath + "\" type=\"video/mp4\">Your browser does not support the video tag.</video>";
			//var strHTML = "<img src=\"theme/james/images/bb.gif\" style=\"height: 100%; width: 100%\">";
			$("#welcomeVideo").html(strHTML);
			logMessage("1 = Welcome HTML: " + $("#welcomeVideo").html());
		}
	}	
}

function WelcomeVideoPlay(strClass)
{
	logMessage("######## WelcomeVideoPlay");	
	if ($('#welcomeVideo').length > 0) 
	{

		if($("#welcomeVideo").html().length>0)
		{
			document.getElementById("objWelcomeVideo").play();
			$("#welcomeVideo").show();
			display.muteVideo( );
		}

		if(!$("#welcomeVideo").hasClass(strClass))
		{
			$("#welcomeVideo").removeClass();
			$("#welcomeVideo").addClass(strClass);
		}
		
	}
}
function WelcomeVideoPause(blnUnMute)
{
	logMessage("######## WelcomeVideoPause");	
	if ($('#welcomeVideo').length > 0) 
	{
		if($("#welcomeVideo").html().length>0)
		{
			logMessage("Welcome HTML: " + $("#welcomeVideo").html());
			document.getElementById("objWelcomeVideo").pause();
			$("#welcomeVideo").html("");
			logMessage("Welcome HTML: " + $("#welcomeVideo").html());
			$("#welcomeVideo").hide();
			if(blnUnMute)
				{display.unMuteVideo( );}
		}
	}
}*/