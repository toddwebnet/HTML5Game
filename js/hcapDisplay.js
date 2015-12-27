/**********************************************
 * hcapDisplay.js
 *
 * Interacts with an LG-based display (STB-2000, STB-3000)
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   9/15/2014   Initial version
 **********************************************/

"use strict";

function HcapDisplay( ) {
   trace( "About to call Display" );
   Display.call( );
   trace( "Back from Display call" );
}

HcapDisplay.prototype = Object.create( Display.prototype );

HcapDisplay.prototype.initialize = function( ) {
   trace( "Initializing HcapDisplay" );
	
   /* define constants */
   this.constant = {
      TVMODE_TV: hcap.mode.HCAP_MODE_2
     ,TVMODE_PORTAL: hcap.mode.HCAP_MODE_4
     ,TVMODE_GUIDE: hcap.mode.HCAP_MODE_4
     ,POWERMODE_OFF: hcap.power.PowerMode.WARM
     ,POWERMODE_STANDBY: hcap.power.PowerMode.WARM
     ,POWERMODE_ON: hcap.power.PowerMode.NORMAL
   };

   /* define key codes */
   this.keyCode = {
      UP: hcap.key.Code.UP
     ,DOWN: hcap.key.Code.DOWN
     ,GUIDE: hcap.key.Code.GUIDE
     ,EXIT: hcap.key.Code.EXIT
     ,BACK: hcap.key.Code.BACK
     ,PORTAL: hcap.key.Code.PORTAL
     ,RIGHT: hcap.key.Code.RIGHT
     ,LEFT: hcap.key.Code.LEFT
     ,CH_UP: hcap.key.Code.CH_UP
     ,CH_DN: hcap.key.Code.CH_DOWN
     ,INFO: hcap.key.Code.INFO
     ,ENTER: hcap.key.Code.ENTER
		 ,RED: hcap.key.Code.RED
		 ,GREEN: hcap.key.Code.GREEN
		 ,YELLOW: hcap.key.Code.YELLOW
		 ,BLUE: hcap.key.Code.BLUE
   };

   /* define members */
   this.property = {
      ipAddress: undefined
     ,tvMode: undefined
     ,powerMode: undefined
     ,channel: undefined
     ,videoMute: undefined
     ,videoX: undefined
     ,videoY: undefined
     ,videoW: undefined
     ,videoH: undefined
     ,serialNumber: undefined
     ,modelName: undefined
     ,roomNumber: undefined
     ,platformManufacturer: undefined
     ,application: new Array( )
     ,hcapJsExtensionVersion: undefined 
     ,hcapMiddlewareVersion: undefined 
     ,bootVersion: undefined 
     ,platformSrcRevision: undefined 
	  ,ptcVersion: undefined
     ,hardwareVersion: undefined 
     ,floatingUISetting: undefined
     ,securityLevel: undefined
   };
   
   /* gather properties */
   var _this = this;

   /* serial number */
   hcap.property.getProperty( {
      "key": "serial_number" 
     ,"onSuccess": function( s ) {
         _this.property.serialNumber = s.value;
      }
   });

   /* model name */
   hcap.property.getProperty({
      "key": "model_name",
      "onSuccess":function(s) {
         _this.property.modelName = s.value;
      }
      ,"onFailure" : function( f ) {
         logMessage("Could not retrieve model name: errorMessage = " + f.errorMessage);
       }
   });

   /* platform version */
   hcap.property.getProperty({
      "key": "platform_version",
      "onSuccess":function(s) {
         _this.property.platformVersion = s.value;
      }
      ,"onFailure" : function( f ) {
         logMessage("Could not retrieve platform version: errorMessage = " + f.errorMessage);
       }
   });

   /* room number*/
   hcap.property.getProperty({
      "key": "room_number",
      "onSuccess":function(s) {
         _this.property.roomNumber = s.value;
      }
      ,"onFailure" : function( f ) {
         logMessage("Could not retrieve room number: errorMessage = " + f.errorMessage);
       }
   });

   /* hcap JS Extension Version */
   hcap.property.getProperty({
      "key": "hcap_js_extension_version"
     ,"onSuccess":function(s) {
         _this.property.hcapJsExtensionVersion = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve hcap JS Extension Version: errorMessage = " + f.errorMessage);
       }
   });

   /* hcap Middleware Version */
   hcap.property.getProperty({
      "key": "hcap_middleware_version"
     ,"onSuccess":function(s) {
         _this.property.hcapMiddlewareVersion = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve hcap Middleware Version: errorMessage = " + f.errorMessage);
       }
   });

   /* Boot Version */
   hcap.property.getProperty({
      "key": "boot_version"
     ,"onSuccess":function(s) {
         _this.property.bootVersion = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve Boot Version: errorMessage = " + f.errorMessage);
       }
   });

   /* Platform Src Revision */
   hcap.property.getProperty({
      "key" : "platform_src_revision"
     ,"onSuccess" : function(s) {
         _this.property.platformSrcRevision = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve Platform Src Revision: errorMessage = " + f.errorMessage);
       }
   });

   /* Platform Manufacturer */
   hcap.property.getProperty({
      "key" : "platform_manufacturer"
     ,"onSuccess" : function(s) {
         _this.property.platformManufacturer = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve Platform Manufacturer: errorMessage = " + f.errorMessage);
       }
   });
   /* hcap PTC Software Version */
   hcap.property.getProperty({
      "key": "ptc_version"
     ,"onSuccess":function(s) {
         _this.property.ptcVersion = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve hcap PTC Software Version: errorMessage = " + f.errorMessage);
       }
   });
   /* Hardware Version */
   hcap.property.getProperty({
      "key" : "hardware_version"
     ,"onSuccess" : function(s) {
         _this.property.hardwareVersion = s.value;
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve Hardware Version: errorMessage = " + f.errorMessage);
       }
   });

   /* Floating UI setting */
   hcap.property.getProperty({
      "key" : "tv_channel_attribute_floating_ui"
      ,"onSuccess" : function(s) {
         logMessage( "Floating UI is currently set to " + s.value );
         _this.property.floatingUISetting = s.value;
         if( s.value == "1" ){
            hcap.property.setProperty( {
               "key" : "tv_channel_attribute_floating_ui"
               ,"value" : "0"
               ,"onSuccess" : function( ) {
                  logMessage( "Float UI set off" );
                  _this.property.floatingUISetting = "0";
               }
               ,"onFailure" : function( ) {
                  logMessage("Could not set floatUI setting: errorMessage = " + f.errorMessage);
               }
            } );
         }
      }
      ,"onFailure" : function( f ) {
         logMessage("Could not retrieve floating UI setting: errorMessage = " + f.errorMessage);
      }
   });
   
   
  hcap.property.getProperty({
      "key" : "boot_sequence_option"
      ,"onSuccess" : function(s) {
         logMessage( "Boot Sequence Prop is currently set to " + s.value );
         _this.property.floatingUISetting = s.value;
         if( s.value == "1" ){
            hcap.property.setProperty( {
               "key" : "boot_sequence_option"
               ,"value" : "0"
               ,"onSuccess" : function( ) {
                  logMessage( "Boot Sequence set to 0(Pro+TV)" );
               }
               ,"onFailure" : function( ) {
                  logMessage("Could not set bootSeq setting: errorMessage = " + f.errorMessage);
               }
            } );
         }
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve bootSeq setting: errorMessage = " + f.errorMessage);
       }
   });
   
   /* security level setting */
   hcap.property.getProperty({
      "key" : "security_level"
      ,"onSuccess" : function(s) {
         logMessage( "Security level is currently set to " + s.value );
         _this.property.securityLevel = s.value;
         if ( s.value == "1" ) {
            hcap.property.setProperty( {
               "key" : "security_level"
               ,"value" : "2"
               ,"onSuccess" : function( ) {
                  logMessage( "Security level successfully set to 2" );
                  _this.property.securityLevel = "2";
               }
               ,"onFailure" : function( ) {
                  logMessage("Could not set securityLevel setting: errorMessage = " + f.errorMessage);
               }
            } );
         }
      }
      ,"onFailure" : function( f ) {
         logMessage("Could not retrieve securityLevel setting: errorMessage = " + f.errorMessage);
      }
   });

  hcap.property.getProperty({
      "key" : "soft_ap_ui"
      ,"onSuccess" : function(s) {
         logMessage( "soft_ap_ui is currently set to " + s.value );
         _this.property.floatingUISetting = s.value;
         if( s.value == "1" ){
            hcap.property.setProperty( {
               "key" : "soft_ap_ui"
               ,"value" : "0"
               ,"onSuccess" : function( ) {
                  logMessage( "soft_ap_ui set to 0(OFF)" );
               }
               ,"onFailure" : function( ) {
                  logMessage("Could not set soft_ap_ui setting: errorMessage = " + f.errorMessage);
               }
            } );
         }
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve soft_ap_ui setting: errorMessage = " + f.errorMessage);
       }
   });
   
  hcap.property.getProperty({
      "key" : "soft_ap"
      ,"onSuccess" : function(s) {
         logMessage( "soft_ap is currently set to " + s.value );
         _this.property.floatingUISetting = s.value;
         if( s.value == "1" ){
            hcap.property.setProperty( {
               "key" : "soft_ap"
               ,"value" : "0"
               ,"onSuccess" : function( ) {
                  logMessage( "soft_ap set to 0(OFF)" );
               }
               ,"onFailure" : function( ) {
                  logMessage("Could not set soft_ap setting: errorMessage = " + f.errorMessage);
               }
            } );
         }
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not retrieve soft_ap setting: errorMessage = " + f.errorMessage);
       }
   });   
  
   this.getPowerMode( );

   /* ipAddress */
   this.getIpAddress( );
   trace( "Done Initializing HcapDisplay" );
}

HcapDisplay.prototype.setTvMode = function( tvMode ) {
   var _this = this;

   hcap.mode.setHcapMode({
      "mode": tvMode,
      "onSuccess":function() {
         _this.property.tvMode = tvMode;
       }, 
      "onFailure":function(f) {
        logMessage( "FAILURE ON SET MODE: " + f.errorMessage + "<BR>" );
      }  
   });

}

HcapDisplay.prototype.getIpAddress = function( ) {
   var _this = this;

   /* ip address */
   hcap.network.getNetworkInformation({
      "onSuccess": function( s ) {
         _this.property.ipAddress = s.ip_address;
      }
      ,"onFailure" : function( f ) {
         logMessage("Could not retrieve IP address: errorMessage = " + f.errorMessage);
       }
   });

}

HcapDisplay.prototype.setVideoAttributes = function( x, y, w, h ) {

   this.videoX = x;
   this.videoY = y;
   this.videoW = w;
   this.videoH = h;
   logMessage( "******** Setting video attributes to " + x + ", " + y + ", " + w + ", " + h );

   hcap.video.setVideoSize({
     "x": x, 
     "y": y,
     "width": w,
     "height": h,
     "onSuccess":function() {
     }, 
     "onFailure":function(f) {
         logMessage("ERROR: Could not set video attributes: " + f.errorMessage + " X = " + x + " Y = " + y + " W = " + w + " H = " + h );
     }
   });
}

HcapDisplay.prototype.setupEvents = function( ) {
   /* grab and clear the current channel subtitle settings */
   getChannelSubtitleIndex( true );

   hcap.socket.openTcpDaemon({
        "port": _listenPort,
        "onSuccess":function() {
        }, 
        "onFailure":function(f) {
           logMessage( "Could not open TCP Socket: " + f.errorMessage );
        }
   });   

   document.addEventListener ( 
        "tcp_data_received",
         function(param) {
            /* {Number} param.port - port number of TCP connection through which TCP data is received.
               {String} param.data - received TCP data. */
            handleIncomingTCP( param.data );
         },
         false
   );   

   var _this = this;

   $(document).keydown( function( event ) {
       _this.keyHandler( event )
   });

   /* to know when the welcome video has quit playing. Currently when that happens, go to the welcome page */
   document.addEventListener(
      "media_event_received",
      function(param) {
         switch( param.eventType ) {
            case "play_end" : 
            case "file_not_found" :
               _this.removeWelcomeVideo( );
               _welcomeVideoAlreadyPlayed = true;
               if ( pms.checkedIn ) {
                  pms.reportWelcomeVideoPlayed( );
               }
               break;
         }
      },
      false
   );

   document.addEventListener(
      "channel_changed", 
      function( param ) {
         if ( param.result ) { /* true returned */
						
						
						
            hcap.channel.getCurrentChannel({
               "onSuccess" : function( s ) {
                  logMessage( "********** in getCurrentChannel. Logical number is " + s.logicalNumber );
                  _this.property.channel = s.logicalNumber;
         
                  channelGuide.showChannelBanner( );
                  /* report the channel change */
                  if ( _this.property.serialNumber != undefined ) {
                      _this.sendData( "<clientData>"
                                    + "<dataType>CHANNEL_CHANGE</dataType>"
                                    + "<serialNumber>" + _this.serialNumber + "</serialNumber>"
                                    + "<logicalChannel>" + s.logicalNumber + "</logicalChannel>"
                                    + "</clientData>" );
                  }
                  if ( context.currentContext == context.constant.GUIDE_PAGE && _inContextCounter >= 3 ) {
                     /* switch to the TV with the new channel, but only if we've been in the guide page more than
                        three seconds, as when coming from a media-playing context there is a channel change that gets called */
                     context.switchToContext( context.constant.TELEVISION );
                  }
									if(context.currentContext  == context.constant.WELCOME_VIDEO && _inContextCounter >= 3 )
									{
										//Changing from Welcome video to TELEVISION
										_this.removeWelcomeVideo( );
										//context.switchToContext(context.constant.TELEVISION);
									}
                  if( context.currentContext == context.constant.APPLICATIONS_PAGE ) {
                        display.muteVideo( );
                  }
               }, 
               "onFailure":function(f) {
                  logMessage("Could not get current channel : errorMessage = " + f.errorMessage);
               }
            });            
         }
      },
      false
   );


   /* sense an apparent power-down (when power mode switches to WARM) */
   document.addEventListener(
      "power_mode_changed",
      function() {
         _this.getPowerMode( );
      },
      false
   );
  
   document.addEventListener(
      "current_channel_subtitle_changed",
      function() {
         var clear;
         if ( context.currentContext == context.constant.TELEVISION ) {
            clear = false; /* don't clear subtitles on the TV */
         }
         else {
            clear = true;
         }
         getChannelSubtitleIndex( clear  ); /* capture the current subtitle index. Clear if specified */
        },
        false
   );

   reportIn( );
}

HcapDisplay.prototype.getPowerMode = function( ) {
   var _this = this;

   hcap.power.getPowerMode( {
      "onSuccess":function(s) {
         _this.property.powerMode = s.mode;
         switch ( s.mode ) {
            case hcap.power.PowerMode.WARM :
               reportPowerDown( );
               context.switchToContext(  );
               break;
            case hcap.power.PowerMode.NORMAL :
               _this.muteVideo( );
               logMessage( "Switching to initial context since PowerMode just changed to NORMAL" );
               context.switchToInitialContext( );

               // Removed. Should not need to do this at any other hotels. 
               //setTimeout(function( ) { startChannelFix( ); }, 1500); 

               reportPowerUp( );
               break;
         }
      }, 
      "onFailure":function(f) {
        logMessage("Could not determine current power mode : errorMessage = " + f.errorMessage);
      }   
   });
}   

function startChannelFix ( ) {
   hcap.channel.requestChangeCurrentChannel({
      "channelType":hcap.channel.ChannelType.RF, 
      "rfBroadcastType": 0,
      "logicalNumber": 15, 
      "onSuccess":function() {
         logMessage("Start Channel Fix: We Changed!!!!");
      }, 
      "onFailure":function(f) {
         logMessage("Start Channel Fix: Could not change RF channel to logical channel " + logicalChannel + " : errorMessage = " + f.errorMessage);
      }
   });
}
   
HcapDisplay.prototype.keyHandler = function( event ) {
/*   logMessage("keyHandler: " + event.keyCode ); */
   /* there is an issue with phantom keys that 
      are sent with the Power On for some boxes, so if
      we receive a key within 3 seconds of power up, or if we're currently not in ON mode, disregard */
	 var _this = this;
   if ( _startUpCounter <= 3 || this.property.powerMode != this.constant.POWERMODE_ON ) {
      return;
   }

   /* if current context is the guide and it's being built, ignore keystrokes */
   if ( context.currentContext == context.constant.GUIDE_PAGE && channelGuide.buildingGuide ) {
      return;
   }

   /* first handle any "do something on key press" events */
   if ( $( "#lightboxBkg" ).is( ":visible" ) ) {
      switch( context.currentContext ) {
         case context.constant.SURVEY_PAGE :
            $( "#lightboxBkg" ).hide( );
            var nextContext = $( "#lightbox" ).attr( "nextContext" );
            if ( nextContext != undefined && nextContext != context.constant.SURVEY_PAGE ) {
               context.switchToContext( nextContext );
            }
            break;
      }
      return; /* key has been handled */
   }


   switch ( event.keyCode ) {
      case this.keyCode.EXIT :
         nav.navigateBackwards( );
         break;

      case this.keyCode.BACK :
         nav.navigateBackwards( );
         break;

      case this.keyCode.PORTAL :
         context.switchToContext( context.constant.WELCOME_PAGE );
         break;

      case this.keyCode.GUIDE :
         /* if current context is not television, save the current context */
         if ( context.currentContext != context.constant.TELEVISION ) {
            context.contextStack.push( context.currentContext, nav.currentItem );
         }
         context.switchToContext( context.constant.GUIDE_PAGE );
         break;

      case this.keyCode.UP :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navUp( );
         }
         break;

      case this.keyCode.DOWN :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navDown( );
         }
         break;

      case this.keyCode.RIGHT :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navRight( );
         }
         break;

      case this.keyCode.LEFT :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navLeft( );
         }
         break;

      case this.keyCode.ENTER :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.performNavigation( nav.items[ nav.currentItem ].target );
         }
         break;

      case this.keyCode.CH_UP:
         switch ( context.currentContext ) {
            case context.constant.GUIDE_PAGE :
               channelGuide.scrollChannelGuide( "up", "bottom" );
               break;
            case context.constant.WELCOME_PAGE :
            case context.constant.WEATHER_PAGE :
            case context.constant.APPLICATIONS_PAGE :
            case context.constant.COMPENDIUM_PAGE :
               context.switchToContext( context.constant.TELEVISION );
               break;
            case context.constant.TELEVISION :
               break;
         }

         break;
      case this.keyCode.CH_DN:
         switch ( context.currentContext ) {
            case context.constant.GUIDE_PAGE :
               channelGuide.scrollChannelGuide( "down", "top" );
               break;
            case context.constant.WELCOME_PAGE :
            case context.constant.WEATHER_PAGE :
            case context.constant.APPLICATIONS_PAGE :
            case context.constant.COMPENDIUM_PAGE :
               context.switchToContext( context.constant.TELEVISION );
               break;
            case context.constant.TELEVISION :
               break;
         }

         break;

      case this.keyCode.INFO:
         if ( context.currentContext == context.constant.TELEVISION || context.currentContext == context.constant.WELCOME_PAGE ) {
            channelGuide.showChannelBanner( );
         }
         break;
			case this.keyCode.RED:
         display.muteVideo( );
         break;
			case this.keyCode.GREEN:
         display.unMuteVideo( );
         break;
			case this.keyCode.YELLOW:
				logMessage("Yellow button push");
				_this.removeWelcomeVideo( );
				break;
   }
}

/* will simulate the muting of the video by blacking out the "TV" image */
HcapDisplay.prototype.muteVideo = function( ) {
   hcap.video.isVideoMute({
      "onSuccess":function(s) {
         if(!s.videoMute) {
            hcap.video.setVideoMute({
                 "videoMute": true,
                 "onSuccess":function() {
                    logMessage( "Successfully muted video" );
                 }, 
                 "onFailure":function(f) {
                     logMessage("Could not mute video : errorMessage = " + f.errorMessage);
                 }
            });   
         }
      },
      "onFailure":function(f) {
         logMessage( "Mute failed" + f.errorMessage );
      }
   });
}

HcapDisplay.prototype.unMuteVideo = function( ) {
   if ( typeof customVideoEffects === "function" ) {
      customVideoEffects( );
   }
   
   hcap.video.isVideoMute({
      "onSuccess":function(s) {
         if(s.videoMute){
            hcap.video.setVideoMute({
                 "videoMute": false,
                 "onSuccess": function() {
                    logMessage( "Successfully UNMUTED video" );
                 }, 
                 "onFailure": function(f) {
                     logMessage("Could not UNMUTE video : errorMessage = " + f.errorMessage);
                 }
            });
         }
      },
      "onFailure":function(f) {
         logMessage( "UNMUTED failed" + f.errorMessage );
      }
   });
}

/* initializes the preloaded application list */
HcapDisplay.prototype.loadApplications = function( ) {
   var _this = this;

   hcap.preloadedApplication.getPreloadedApplicationList( {
      "onSuccess" : function(s) {
         for (var i = 0; i < s.list.length; i++) {
            /* locate the preloaded application from the config (if it exists, and apologies for the brute force here) */
            var found = false;
            for ( var j = 0; j < _this.property.application.length && !found; j++ ) {
               if ( _this.property.application[ j ].title == s.list[ i ].title ) {
                  _this.property.application[ j ].id = s.list[ i ].id;
                  if ( _this.property.application[ j ].icon == '' ) { /* if not already overridden */
                     _this.property.application[ j ].icon = s.list[ i ].iconFilePath;
                  }
               }
            }
         }
     },
     "onFailure":function(f) {
         logMessage("could not load preloaded apps: errorMessage = " + f.errorMessage);
         for ( var i=0; i < _this.property.application.length; i++ ) { /* create a dummy set */
            _this.property.application[ i ].id = i+1;
         }
     }
   });   
}

HcapDisplay.prototype.launchApplication = function( applicationIX ) {
   /* if the app has a target or a url, launch the target or browser with url, otherwise
      launch the preloaded application */
   logMessage( "Launching application " + applicationIX + " - " + this.property.application[ applicationIX ].title );
   if ( this.property.application[ applicationIX ].url > '' ) {
      /* find the browser app */
      var url = this.property.application[ applicationIX ].url;
      var browserApp = this.property.application[ applicationIX ].browserApp;

      if ( browserApp == undefined || browserApp == '' ) {
         logMessage( "ERROR: No browserApp specified for application " + this.property.application[ applicationIX ].title );
      }
      else {
         /* find the browser application */
         var found = false;
         for ( var i=0; i<this.property.application.length && !found; i++ ) {
            if ( this.property.application[ i ].title == browserApp ) {
               found = true;
               /* if found, set the default url and launch the browser */
               var id = this.property.application[ i ].id;
               var title = this.property.application[ i ].title;

               // REFACTOR AS "LAUNCH BROWSER APP"
               hcap.property.setProperty({
                 "key":"full_browser_start_page_url", 
                 "value": url, 
                 "onSuccess":function() {
                     display.muteVideo( );
                     hcap.preloadedApplication.launchPreloadedApplication( {
                        "id": id,
                        "onSuccess":function() {
                           /* log this activity with the procentric server */
                           this.sendData( "<clientData>"
                                           + "<dataType>APP_LAUNCH</dataType>"
                                           + "<serialNumber>" + this.property.serialNumber + "</serialNumber>"
                                           + "<appName>" + title + ":" + url + "</appName>"
                                           + "</clientData>" );
                        },
                        "onFailure":function(f) {
                            logMessage("Could not launch browser: errorMessage = " + f.errorMessage);
                        }
                     });
                  }
                 ,"onFailure" : function( f ) {
                     logMessage("Could not set browser start page: errorMessage = " + f.errorMessage);
                   }
               });
            }
         }

         if ( !found ) {
            logMessage( "ERROR: Could not locate browser app " + browser );
         }
      }
   }
   else {
      if ( this.property.application[ applicationIX ].target > '' ) {
         nav.performNavigation( this.property.application[ applicationIX ].target );
      }
      else {
         /* launch the preloaded application */
         display.muteVideo( );
         hcap.preloadedApplication.launchPreloadedApplication({
            "id": this.property.application[ applicationIX ].id,
            "onSuccess":function() {
               /* log this activity with the procentric server */
        /*       this.sendData( "<clientData>"
                               + "<dataType>APP_LAUNCH</dataType>"
                               + "<serialNumber>" + this.property.serialNumber + "</serialNumber>"
                               + "<appName>" + this.property.application[ applicationIX ].title + "</appName>"
                               + "</clientData>" ); */
               }, 
            "onFailure":function(f) {
                logMessage("Application Launch Error: errorMessage = " + f.errorMessage);
            }
         });
      }
   }
}

HcapDisplay.prototype.gotoTV = function( ) {
   /* go back to full size video */
   this.setVideoAttributes( _vidX, _vidY, _vidW, _vidH );
   if ( typeof customVideoEffects === "function" ) {
      customVideoEffects( );
   }
   channelGuide.showChannelBanner( );
}

HcapDisplay.prototype.gotoChannel = function( logicalChannel ) {
   var _this = this;

   /* get attributes of current channel, use these to deduce the type of the new channel */
   hcap.channel.getCurrentChannel({
     "onSuccess":function(s) {
         var channelType = s.channelType;
         var rfBroadcastType = s.rfBroadcastType;
         var ipBroadcastType = s.ipBroadcastType;
         var ip = s.ip;
         var port = s.port;
/*         
             logMessage( " channel status    : " + s.channelStatus );
             logMessage( " channel type      : " + s.channelType     );
             logMessage( " logical number    : " + s.logicalNumber   );
             logMessage( " frequency         : " + s.frequency       );
             logMessage( " program number    : " + s.programNumber   );
             logMessage( " major number      : " + s.majorNumber     );
             logMessage( " minor number      : " + s.minorNumber     );
             logMessage( " satellite ID      : " + s.satelliteId     );
             logMessage( " polarization      : " + s.polarization    );
             logMessage( " rf broadcast type : " + s.rfBroadcastType );
             logMessage( " ip                : " + s.ip              );
             logMessage( " port              : " + s.port            );
             logMessage( " ip broadcast type : " + s.ipBroadcastType );
             logMessage( " symbol rate       : " + s.symbolRate      );
             logMessage( " pcr pid           : " + s.pcrPid          );
             logMessage( " video pid         : " + s.videoPid        );
             logMessage( " video stream type : " + s.videoStreamType );
             logMessage( " audio pid         : " + s.audioPid        );
             logMessage( " audio stream type : " + s.audioStreamType );
             logMessage( " signal strength   : " + s.signalStrength  );
             logMessage( " source address    : " + s.sourceAddress   );
*/
         switch( channelType ) {
            case hcap.channel.ChannelType.RF :
               hcap.channel.requestChangeCurrentChannel({
                    "channelType":hcap.channel.ChannelType.RF, 
                    "logicalNumber": logicalChannel, 
                    "rfBroadcastType": rfBroadcastType,
                    "onSuccess":function() {
                        context.switchToContext( context.constant.TELEVISION );
                    }, 
                    "onFailure":function(f) {
                        logMessage("Could not change RF channel to logical channel " + logicalChannel + " : errorMessage = " + f.errorMessage);
                    }
               });

               break;

            case hcap.channel.ChannelType.IP :
               hcap.channel.requestChangeCurrentChannel({
                    "channelType":hcap.channel.ChannelType.IP, 
                    "ipBroadcastType": hcap.channel.IpBroadcastType.UDP,
                    "ip" : "224.1.1.10",
                    "port" : 10000,
                    "videoStreamType": hcap.channel.VideoStreamType.MPEG2,
                    "audioStreamType": hcap.channel.AudioStreamType.MPEG2,
                    "sourceAddress" : "192.168.163.1",
                    "onSuccess":function() {
                       logMessage( "Successfully changed channel to logical channel: " + logicalChannel );
                       context.switchToContext( context.constant.TELEVISION );
                    }, 
                    "onFailure":function(f) {
                        logMessage("Could not change IP channel to logical channel " + logicalChannel + " : errorMessage = " + f.errorMessage);
                    }
               });
//
//               var origFloatingUISetting = "0";
//
//               logMessage( "**** CHANNEL TYPE IS IP" );
//               /* because we haven't had luck changing the channel via the requestChangeCurrentChannel 
//                * command for IP channels, just send the remote keys for the channel to the TV */
//
//               logMessage( "FLOATING UI SETTING IS CURRENTLY " + _this.property.floatingUISetting );
//               /* if the floating UI setting is on, turn it off temporarily so we won't see the channel change here */
//               if ( _this.property.floatingUISetting == "1" || 1 ) {
//                  origFloatingUISetting = "1";
////                  _this.setFloatingUI( false );
//               }
//
//               var looping = true;
//               var lc = logicalChannel;
//               var lc1;
//
//               while ( looping ) {
//                  logMessage( "Looping: " + lc );
//                  if ( lc < 10 ) {
//                     looping = false;
//                     logMessage( "Looping DONE - SENDING: " + lc );
//                     _this.sendKey( hcap.key.Code.NUM_0 + lc );
//                  }
//                  else {
//                     lc1 = Math.round( lc / 10 );
//                     lc -= ( lc1 * 10 );
//                     logMessage( "STILL LOOPING: " + lc1 + " - " + lc );
//                     _this.sendKey( hcap.key.Code.NUM_0 + lc1 );
//                  }
//               }
//// Don't send this as it sends the ENTER key through again.
////               _this.sendKey( hcap.key.Code.ENTER );
//
//               /* if the floating UI setting was originally on, set it back to on here */
//               if ( origFloatingUISetting == "1" ) {
//               //   _this.setFloatingUI( true );
//               }

               break;
               
           } 
        },
        "onFailure":function(f) {
            logMessage("Could not get channel information for current channel : errorMessage = " + f.errorMessage);
        }
   });   
}

HcapDisplay.prototype.sendData = function( data ) {

   hcap.socket.sendUdpData({
     "ip": _server,
     "port": _sendPort,
     "udpData": data,
     "onSuccess":function() {
     }, 
     "onFailure":function(f) {
         //Bill's Looping Code
         //logMessage("Send UDP Data: Could not send UDP packet to the server: errorMessage = " + f.errorMessage);
     }
   });
}

// REFACTOR - Pass a video object to this, not specifically a welcome video
// Load Config will create the welcome video object
HcapDisplay.prototype.playWelcomeVideo = function( ) {
	logMessage("Starting Video");	 
   if ( _welcomeVideoPlaying ) { 
		 logMessage(" it's already playing");	
      return; 
   }
	
	 logMessage("######## trying to start playing video");		 
   showSpinner( );
   hcap.Media.startUp({
      "onSuccess":function() {
         _welcomeVideoMedia = hcap.Media.createMedia({
            "url": _welcomeVideoURL, 
            "mimeType":"video/mp4",						
            "onSuccess":function() {
							_welcomeVideoPlaying = true;
							hideSpinner( );
            },
            "onFailure":function( f ) {
               logMessage("Failure on media create : errorMessage = " + f.errorMessage);
               hideSpinner( );
            }
         });
         _welcomeVideoMedia.play({
					   "repeatCount":0,
             "onSuccess":function() {
							 logMessage("Succesfully loaded Video");
                             
							 
             }, 
             "onFailure":function(f) {
                 logMessage("Failure on media play : errorMessage = " + f.errorMessage);
             }
         });
      },
      "onFailure": function(f) {
         logMessage("Failure on media startup : errorMessage = " + f.errorMessage);

				 
      }
   });
}
	
HcapDisplay.prototype.removeWelcomeVideo = function( ) {
	
	if ( !_welcomeVideoPlaying ) 
		{ logMessage("Not shutting down video... not running");return; }

	logMessage("Shutting Down Video--------");
		showSpinner();
   _welcomeVideoShutdownInProgress = true;
   if ( _welcomeVideoMedia ) {
      _welcomeVideoMedia.stop({
         "onSuccess":function() {
             _welcomeVideoMedia.destroy({
                 "onSuccess":function() {
                     hcap.Media.shutDown({
                         "onSuccess":function() {
													    hideSpinner( );
                             _welcomeVideoPlaying = false;
                             _welcomeVideoShutdownInProgress = false;
														 if(context.contextSwitchPending)
														 {
															context.switchToContext(context.constants.WELCOME_PAGE);
														 }
                            
                             
                         }, 
                         "onFailure":function(f) {
                             hideSpinner( );
														 logMessage("Failure on media shutdown : errorMessage = " + f.errorMessage);
                         }
                     });
                 }, 
                 "onFailure":function(f) {
									   hideSpinner( );
                     logMessage("Failure on media destroy : errorMessage = " + f.errorMessage);
                 }
             });
          }
         ,"OnFailure": function(f) {
            logMessage("Failure on media stop : errorMessage = " + f.errorMessage);
           }
      });
   }
}

/* sets the local time based on the time components */
HcapDisplay.prototype.setTime = function( year, month, day, hour, minute, second, gmtOffsetMinutes, isDst ) {

   hcap.time.setLocalTime( {
      "year": year, 
      "month": month,
      "day": day,
      "hour": hour,
      "minute": minute,
      "second": second,
      "gmtOffsetInMinute": gmtOffsetMinutes,
      "isDaylightSaving": isDst, 
      "onSuccess": function() {
          logMessage( "Successfully syncronized to server time" );
      }, 
      "onFailure": function(f) {
         logMessage("Could not set localTime : errorMessage = " + f.errorMessage);
      }
    });
} 

HcapDisplay.prototype.setRoomNumber = function( roomNumber ) {
   var _this = this;
   hcap.property.setProperty({
     "key":"room_number", 
     "value": roomNumber, 
     "onSuccess":function() {
         logMessage( "Room number changed to " + roomNumber );
         _this.property.roomNumber = roomNumber;
         reportIn( );
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not change room number: errorMessage = " + f.errorMessage);
       }
   });
}

HcapDisplay.prototype.sendKey = function( virtualKeyCode ) {

   hcap.key.sendKey({
     "virtualKeycode": virtualKeyCode,
     "onSuccess":function() {
        logMessage( "Successfully sent key code " + virtualKeyCode + " to TV" );
     }, 
     "onFailure":function(f) {
         logMessage( "ERROR: Could not send key : errorMessage = " + f.errorMessage) ;
     }
   });
}

HcapDisplay.prototype.setFloatingUI = function( on ) {

   var value = "0";

   if ( on ) {
      value = "1";
   }

   this.property.floatingUISetting = value;

   logMessage( "Setting floating UI setting to " + value );
   hcap.property.setProperty({
     "key" : "tv_channel_attribute_floating_ui", 
     "value" : value, 
     "onSuccess" : function() {
      }
     ,"onFailure" : function( f ) {
         logMessage("Could not set floating ui attribute: " + f.errorMessage);
       }
   });
}

HcapDisplay.prototype.powerOff = function( ) {
   hcap.power.powerOff({
     "onSuccess":function() {
        logMessage( "Powered off the TV" );
     }, 
     "onFailure":function(f) {
        logMessage( "ERROR: Could not power off TV: " + f.errorMessage );
     }
   });
}

HcapDisplay.prototype.checkOut = function( ) {
   var _this = this;
   logMessage("Checkout Function: Called");
   /* set the security mode to 1, which will clear any security seconds before a power off */
   hcap.property.setProperty( {
      "key" : "security_level"
     ,"value" : "1"
     ,"onSuccess" : function( ) {
        logMessage( "Checkout Function: Security level successfully set to 1 before power off" );
        _this.property.securityLevel = "1";
        /* rebooting now instead of poweroff */
        hcap.power.reboot({
           "onSuccess": function( ) {
              logMessage( "Checkout Function: Device rebooted. Check out process completed" );
              display.sendData( "<clientData>"
                      + "<dataType>CHECKOUT_COMPLETED</dataType>"
                      + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                      + "<roomNumber>" + display.property.roomNumber + "</roomNumber>"
                      + "</clientData>" 
              );
           }
          ,"onFailure":function(f) {
              logMessage( "ERROR: Could not reboot Device: " + f.errorMessage );
           }
        });
      }
     ,"onFailure" : function( ) {
          logMessage("Could not set securityLevel setting: errorMessage = " + f.errorMessage);
      }
  });
}

HcapDisplay.prototype.clearCredentials = function( ) {
   var _this = this;
   logMessage( "Clear Credentials: Called" );
   /* set the security mode to 1, which will clear any security seconds before a power off */
   hcap.property.setProperty( {
      "key" : "security_level"
     ,"value" : "1"
     ,"onSuccess" : function( ) {
        logMessage( "Clear Credentials: Security level successfully set to 1 before power off" );
        _this.property.securityLevel = "1";
      }
     ,"onFailure" : function( ) {
          logMessage("Could not set securityLevel setting: errorMessage = " + f.errorMessage);
      }
  });
  logMessage( "Clear Credentials: Calling Reboot" );
  setTimeout( function( ) { _this.reboot(); }, 5000 ); 
   
}

HcapDisplay.prototype.reboot = function( ) {
   logMessage("Reboot Initiated")
   hcap.power.reboot({
     "onSuccess":function() {
     }, 
     "onFailure":function(f) {
        logMessage( "ERROR: Could not reboot TV " + f.errorMessage );
     }
   });
}   
