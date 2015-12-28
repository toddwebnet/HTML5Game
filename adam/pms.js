/**********************************************
 * pms.js
 *
 * Interacts with PMS messages coming from the Adam server
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   9/23/2014   Initial version
 **********************************************/

"use strict";

function PMS( ) {
   trace( "PMS Constructor" );
}

PMS.prototype.initialize = function( xml ) {
   trace( "PMS.initialize" );
   /* load PMS congiguration */
   this.dataRequestInterval = getZoneConfigValue( "pmsDataRequestIntervalMs" );
   this.welcomeMessagePMS = getThemeConfigValue( "welcomeMessagePMS", false );
   this.welcomeMessageNonPMS = getThemeConfigValue( "welcomeMessageNonPMS", false );
   this.nonPMSDelay = 10000;
   this.roomNumber = '';
   this.firstName = '';
   this.lastName = '';
   this.salutation = '';
   this.checkedIn = false;
   
   this.requestPMSData( );
   /* if welcome message not replaced within a few seconds by PMS welcome, set it to non-PMS welcome */
   var _this = this;
   setTimeout( function( ) { setWelcomeMessage( _this.welcomeMessageNonPMS, true ); }, _this.nonPMSDelay ); 
}

/* request PMS Data. Note: Expects serial number and room number to already have been discovered */
PMS.prototype.requestPMSData = function( ) {
   var _this = this;
   /* note: serial number and room number have to be there for this to work. If they are not populated, wait 
      a bit and try again */
   if ( display.property.serialNumber != undefined && display.property.roomNumber != undefined ) {
      display.sendData( "<clientData>"
                      + "<dataType>REQUEST_SEND_PMS</dataType>"
                      + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                      + "<roomNumber>" + display.property.roomNumber + "</roomNumber>"
                      + "</clientData>" 
                      );
      /* make another request in the designated timeframe */
      if ( this.dataRequestInterval != undefined ) {
         setTimeout( function( ) { _this.requestPMSData( ); }, this.dataRequestInterval );
      }
   }
   else { 
      /* try again in a second */
      setTimeout( function( ) { _this.requestPMSData( ); }, 1000 );
   }
}

/* sets PMS data from results of PMS data request */
PMS.prototype.setPMSData = function( xml ) {
   var welcomeMessage;
   var welcomeMessageSet = false;
   var result;
   var _this = this;

  
   $( xml ).find( "serialNumber" ).each( function( ) {
      var pmsSerialNumber = $( this ).text( );
      /* validate the serial number against this unit's serial number */
      if ( pmsSerialNumber == display.property.serialNumber ) {
         $( xml ).find( "result" ).each( function( ) {
            result = $( this ).text( );
         })
         if ( result == "OK" ) {
            $( xml ).find( "firstName" ).each( function( ) {
               _this.firstName = $( this ).text( );
            });
            $( xml ).find( "lastName" ).each( function( ) {
               _this.lastName = $( this ).text( );
            });
            $( xml ).find( "salutation" ).each( function( ) {
               _this.salutation = $( this ).text( );
            });
            $( xml ).find( "roomNumber" ).each( function( ) {
               _this.roomNumber = $( this ).text( );
               if ( _this.roomNumber == display.property.roomNumber ) {
                  /* modify the welcome message and display it */
                  welcomeMessage = _this.welcomeMessagePMS;
                  welcomeMessage = welcomeMessage.replace( "[firstName]", _this.firstName );
                  welcomeMessage = welcomeMessage.replace( "[lastName]", _this.lastName );
                  welcomeMessage = welcomeMessage.replace( "[salutation]", _this.salutation );
                  welcomeMessage = welcomeMessage.replace( "[roomNumber]", _this.roomNumber );
                  setWelcomeMessage( welcomeMessage, false );
                  welcomeMessageSet = true;                              
                  _this.checkedIn = true;
               }            
               else {
                  logMessage( "PMS Room Number does not match the current room number: " + _this.roomNumber + " vs. " + display.property.roomNumber );
                  _this.checkedIn = false;
               }
            });
            $( xml ).find( "welcomeVideoPlayed" ).each( function( ) {
               if ( $( this ).text( ) == 'Y' ) {
                  _welcomeVideoAlreadyPlayed = true;
               }
               else {
                  _welcomeVideoAlreadyPlayed = false;
               }
            });
            $( xml ).find( "marketingPopupSeen" ).each( function( ) {
               if ( $( this ).text( ) == 'Y' ) {
                  _marketingPopupSeen = true;
               }
               else {
                  _marketingPopupSeen = false;
               }
            });
         }
         else {
            logMessage( "PMS request resulted in an error: " + result );
            _this.checkedIn = false;
            $( xml ).find( "welcomeVideoPlayed" ).each( function( ) {
               if ( $( this ).text( ) == 'Y' ) {
                  _welcomeVideoAlreadyPlayed = true;
               }
               else {
                  _welcomeVideoAlreadyPlayed = false;
               }
            });
            $( xml ).find( "marketingPopupSeen" ).each( function( ) {
               if ( $( this ).text( ) == 'Y' ) {
                  _marketingPopupSeen = true;
               }
               else {
                  _marketingPopupSeen = false;
               }
            });
         }
      }
      else {
         logMessage( "PMS Serial Number does not match the current serial number: " + pmsSerialNumber + " vs. " + display.property.serialNumber );
         _this.checkedIn = false;
      }
   });
   if ( !welcomeMessageSet ) {
      /* set welcome message to non-PMS version */
      welcomeMessage = this.welcomeMessageNonPMS;
      setWelcomeMessage( welcomeMessage, false );
   }
}

/* report that the welcome video has been played */
PMS.prototype.reportWelcomeVideoPlayed = function( ) {
   var _this = this;
   display.sendData( "<clientData>"
                      + "<dataType>WELCOME_VIDEO_PLAYED</dataType>"
                      + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                      + "<roomNumber>" + display.property.roomNumber + "</roomNumber>"
                      + "</clientData>" 
                      );
}

/* Report Marketing Popup Seen */
PMS.prototype.reportMarketingPopupSeen = function( ) {
   var _this = this;
   display.sendData( "<clientData>"
                      + "<dataType>MARKETING_POPUP_SEEN</dataType>"
                      + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                      + "<roomNumber>" + display.property.roomNumber + "</roomNumber>"
                      + "</clientData>" 
                      );
}

/* clears out PMS data */
PMS.prototype.clearPMSData = function( ) {
   this.firstName = '';
   this.lastName = '';
   this.salutation = '';
   setWelcomeMessage( this.welcomeMessageNonPMS );
}
