/**********************************************
 * baseDisplay.js
 * Defines the base Display object. The methods
 * here are for a non-TV (i.e., a development environment)
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   9/15/2014   Initial version
 **********************************************/

"use strict";

/* define display object */
function Display( ) {
   trace( "In Display constructor" );
}

/* SHOULD NOT BE EXTENDED BY DESCENDENTS. THIS ASSUMES NON-TV MODE */
Display.prototype.initialize = function( ) {
   trace( "In Display.initialze" );
   /* define constants */
   this.constant = {
      TVMODE_TV: 1
     ,TVMODE_PORTAL: 2
     ,TVMODE_GUIDE: 3
     ,POWERMODE_OFF: 0
     ,POWERMODE_STANDBY: 1
     ,POWERMODE_ON: 2
   };

   /* define key codes. Including remote keycodes in case this is displayed on an actual TV */
   this.keyCode = {
      UP: 38 /* up arrow */
     ,REM_UP: 38 /* remote up */
     ,DOWN: 40 /* down arrow */
     ,REM_DOWN: 40 /* remote down */
     ,GUIDE: 71 /* g */
     ,REM_GUIDE: 458 /* remote guide */
     ,EXIT: 27 /* escape */
     ,REM_EXIT: 1001 /* remote exit */
     ,BACK: 8 /* backspace */
     ,REM_BACK: 461 /* remote back */
     ,PORTAL: 80 /* p */
     ,REM_PORTAL: 602 /* remote portal */
     ,RIGHT: 39 /* right arrow */
     ,REM_RIGHT: 39 /* remote right */
     ,LEFT: 37 /* left arrow */
     ,REM_LEFT: 37 /* remote left */
     ,CH_UP: 33 /* page up */
     ,REM_CH_UP: 427 /* remote channel up */
     ,CH_DN: 34 /* page down */
     ,REM_CH_DN: 428 /* remote channel down */
     ,INFO: 73 /* i */
     ,REM_INFO: 457 /* remote info */
     ,ENTER: 13 /* enter key */
     ,REM_ENTER: 13 /* remote enter */
   };

   /* define members */
   this.property = {
      theme: undefined
     ,tvMode: undefined
     ,powerMode: this.constant.POWERMODE_ON
     ,channel: 1
     ,videoMute: false
     ,serialNumber: undefined
     ,modelName: undefined
     ,roomNumber: undefined
     ,platformManufacturer: undefined
     ,application: new Array( ) 
     ,videoX: undefined
     ,videoY: undefined
     ,videoW: undefined
     ,videoH: undefined
     ,videoScreenShotPrefix: '' /* will generally populate this in a customization */
   };
   this.setTvMode( this.constant.TVMODE_PORTAL );

   /* gather properties */
   this.getIpAddress( );
   this.property.serialNumber = "DEV000000000";
   this.property.modelName = "developmentEnv-nonTV";
   this.property.roomNumber = "DEV001";
   this.property.platformManufacturer = "devComputer";
   this.loadApplications( );

   /* wait two seconds and switch to initial context - this is non-tv mode */
   setTimeout( function( ) { context.switchToInitialContext( ); }, 2000 );
}

Display.prototype.setTvMode = function( tvMode ) {
   this.property.tvMode = tvMode;
}

Display.prototype.getIpAddress = function( ) {
   var _this = this;
   /* call an ajax resource to determine the server IP address */
   $.ajax({
      type: "GET",
      url: "zone/nonTV/actions/ipAddress.get.php",
      dataType: "json",
      success: function( response ) {
         if ( response[ 0 ].status == 'ok' ) {
            _this.property.ipAddress = response[ 1 ].ipAddress;
         }
         else {
            /* TODO - proper error checking and reporting/logging here */

         }
      },
      error: function( ) {
         /* TODO - proper error checking and reporting/logging here */
      }
   });
}

/* will simulate the setting of the video size and position by 
 * making visible a static image already styled the specified size and 
 * position */
Display.prototype.setVideoAttributes = function( x, y, w, h ) {

   this.videoX = x;
   this.videoY = y;
   this.videoW = w;
   this.videoH = h;
   $( "#tv" ).css( "left", x );
   $( "#tv" ).css( "top", y );
   $( "#tv" ).css( "width", w );
   $( "#tv" ).css( "height", h );
   this.unMuteVideo( );
}

Display.prototype.setupEvents = function( ) {
   /* setup a the keyhandler */
   var _this = this;
   $(document).keydown( function( event ) {
       _this.keyHandler( event )
   });

   reportPowerUp( );
   reportIn( );
}

Display.prototype.keyHandler = function( event ) {
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

   /* there is an issue with a phantom portal key that 
      is sent with the Power On for some boxes, so if
      we receive PORTAL within 3 seconds of power up, disregard */
   if ( event.keyCode == this.keyCode.PORTAL && _startUpCounter <= 3 ) {
      return;
   }

   switch ( event.keyCode ) {
      case this.keyCode.EXIT :
      case this.keyCode.REM_EXIT :
         nav.navigateBackwards( );
         break;

      case this.keyCode.BACK :
      case this.keyCode.REM_BACK :
         nav.navigateBackwards( );
         break;

      case this.keyCode.PORTAL :
      case this.keyCode.REM_PORTAL :
         context.switchToContext( context.constant.WELCOME_PAGE );
         break;

      case this.keyCode.GUIDE :
      case this.keyCode.REM_GUIDE :
         /* if current context is not television, save the current context */
         if ( context.currentContext != context.constant.TELEVISION ) {
            context.contextStack.push( context.currentContext, nav.currentItem );
         }
         context.switchToContext( context.constant.GUIDE_PAGE );
         break;

      case this.keyCode.UP :
      case this.keyCode.REM_UP :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navUp( );
         }
         break;

      case this.keyCode.DOWN :
      case this.keyCode.REM_DOWN :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navDown( );
         }
         break;

      case this.keyCode.RIGHT :
      case this.keyCode.REM_RIGHT :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navRight( );
         }
         break;

      case this.keyCode.LEFT :
      case this.keyCode.REM_LEFT :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.navLeft( );
         }
         break;

      case this.keyCode.ENTER :
      case this.keyCode.REM_ENTER :
         if ( context.currentContext != context.constant.TELEVISION ) {
            nav.performNavigation( nav.items[ nav.currentItem ].target );
         }
         break;

      case this.keyCode.CH_UP:
      case this.keyCode.REM_CH_UP:
         switch ( context.currentContext ) {
            case context.constant.GUIDE_PAGE :
               channelGuide.scrollChannelGuide( "up", "top" );
               break;
            case context.constant.TELEVISION :
            case context.constant.WELCOME_PAGE :
               this.goChannelUp( );
               break;
         }

         break;
      case this.keyCode.CH_DN:
      case this.keyCode.REM_CH_DN:
         switch ( context.currentContext ) {
            case context.constant.GUIDE_PAGE :
               channelGuide.scrollChannelGuide( "down", "top" );
               break;
            case context.constant.TELEVISION :
            case context.constant.WELCOME_PAGE :
               this.goChannelDown( );
               break;
         }

         break;

      case this.keyCode.INFO:
      case this.keyCode.REM_INFO:
         if ( context.currentContext == context.constant.TELEVISION || context.currentContext == context.constant.WELCOME_PAGE ) {
            channelGuide.showChannelBanner( );
         }
         break;
   }
}

Display.prototype.goChannelUp = function( ) {
   /* increment current channel */
   this.property.channel++;
   /* if greater than channel lineup, go back to beginning */
   if ( this.property.channel > channelGuide.channel.length ) {
      this.property.channel = 1;
   }

   channelGuide.showChannelBanner( );

}

Display.prototype.goChannelDown = function( ) {
   /* decrement current channel */
   this.property.channel--;
   /* if less than 0, go to the last channel */
   if ( this.property.channel < 1 ) {
     this.property.channel = channelGuide.channel[ channelGuide.channel.length - 1  ].logicalChannel;
   }

   channelGuide.showChannelBanner( );

}

/* will simulate the muting of the video by blacking out the "TV" image */
Display.prototype.muteVideo = function( ) {
   $( "#tv" ).css( "background-color", "black" );
   $( "#tv" ).css( "background-image", "none" );
}

/* will simulate the unmuting of the video by displaying the "TV" image */
Display.prototype.unMuteVideo = function( ) {

   if ( typeof customVideoEffects === "function" ) {
      customVideoEffects( );
   }
   else {
      $( "#tv" ).css( "background-image", "url('" + this.currentVideoImage( ) + "')" );
   }
}

/* this function only makes sense for non-TV devices */
Display.prototype.currentVideoImage = function( ) {
   return( this.property.videoScreenShotPrefix + this.videoW + "x" + this.videoH + ".png" );
}

/* initializes the preloaded application list */
Display.prototype.loadApplications = function( ) {
   for ( var j = 0; j < this.property.application.length; j++ ) {
      this.property.application[ j ].id = 1000 + j; /* simulate an id */
   } 
}

Display.prototype.launchApplication = function( applicationIX ) {
   console.log( "LAUNCHING APPLICATION " + this.property.application[ applicationIX ].title );
}

// REFACTOR - pass the applications div id in
Display.prototype.showApplications = function( ) {
   var appNum = 0;
   for ( var i=0; i < this.property.application.length; i++ ) {
      if ( this.property.application[ i ].id > 0 && this.property.application[ i ].visible ) {
         var idName = "pla";
         appNum++;
         if ( appNum < 10 ) {
            idName += "0";
         }
         idName += appNum;

         if ( this.property.application[ i ].icon > '' ) {
            $( "#" + idName + "Region" ).html( "<img src='" + this.property.application[ i ].icon + "' />" );
         }
         else {
            $( "#" + idName + "Region" ).html( this.property.application[ i ].title );
         }

         $( "#" + idName + "Region" ).addClass( "nav-item" );
         $( "#" + idName + "Region" ).attr( "target", "APP-" + i );
         $( "#" + idName + "Region" ).attr( "internalID", i );
         $( "#" + idName ).show( );
      }
   }

   $( "#preloadedApps" ).show( );
}            

Display.prototype.gotoTV = function( ) {
   /* go back to full size video */
   this.setVideoAttributes( _vidX, _vidY, _vidW, _vidH );
   channelGuide.showChannelBanner( );
}

Display.prototype.gotoChannel = function( logicalChannel ) {
   this.property.channel = logicalChannel;
   context.switchToContext( context.constant.TELEVISION );
}

// REFACTOR - Pass a video object to this, not specifically a welcome video
// Load Config will create the welcome video object
Display.prototype.playWelcomeVideo = function( ) {
   console.log( "Welcome video would play here" );
//   showSpinner( );
//   setTimeout( function( ) { hideSpinner( ); }, 5000 );
}

Display.prototype.removeWelcomeVideo = function( ) {
}

Display.prototype.sendData = function( data ) {
   //console.log( "SendData: " + data );
}

/* doesn't do anything in the base object. Can be extended in descendent objects */
Display.prototype.setTime = function( year, month, day, hour, minute, second, gmtOffsetMinutes, isDst ) {
}

Display.prototype.setRoomNumber = function( roomNumber ) {
   display.property.roomNumber = roomNumber;
}

/* doesn't do anything in the base object */
Display.prototype.checkOut = function( ) {
}

