/**********************************************
 * saver.js
 *
 * This module makes sure we keep a good connection 
 * and regulates connection states.
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Dan Cousar     12/29/2014  Initial version
 **********************************************/

"use strict";

function Saver( ) {
   trace( "Saver Constructor" );
}

Saver.prototype.initialize = function( ) {
   trace( "Saver.initialize" );
   /* load Saver configuration */
   
   this.saverDelay = 15000;
   this.connDown = false;
   this.connDownTimes = 0;
   this.rebootTrying = 0;
   this.powerMode = "";
   
   this.connChecker( );
   trace( "Initialized Saver ");   
   var _this = this;
}

/* Check Connection - ping home */
Saver.prototype.connChecker = function( ) {
   var _this = this;
   trace( "Saver -- ConnChecker Checking ");
   /* ping to see if we are able to talk home */
   hcap.network.ping({
      "ip":_server,
      "onSuccess":function(s) {
	  /* We can talk home, lets make sure we clear everything out that we had possibly set. New day */
       _this.connDown = false; 
		 _this.connDownTimes = 0; 
		 _this.rebootTrying = 0; 
		 trace( "Saver -- ConnChecker Passed. " + _this.connDownTimes);
      }, 
      "onFailure":function(f) {
		/* We didnt make it home */
       _this.connDown = true;
		 _this.connDownTimes++;
		 if(_this.connDownTimes > 4 && _this.rebootTrying == 0){
            trace( "Saver -- ConnChecker rebootTrying ");
            _this.rebootTrying = 1;
            _this.rebootTry();
         }
		 trace( "Saver -- ConnChecker Failed. ");
      }
   });
   /* make another request in the designated timeframe */
   setTimeout( function( ) { _this.connChecker( ); }, _this.saverDelay );
   trace( "Saver -- ConnChecker Checked ");
}

/* rebootTry attempts to reboot */
Saver.prototype.rebootTry = function( ) {
   var _this = this;
   var _powerMode = "";
   trace( "Saver -- rebootTry Start");
   
   if( _this.connDown == false ){
      trace( "Saver -- rebootTry Conn Up Aborting");
      return;
   }
   
   hcap.power.getPowerMode({
      "onSuccess":function(s) {
         trace( "Saver -- rebootTry PowerMode " + s.mode);
		 		 
		 if(s.mode == 2){
            trace( "Saver -- rebootTry Rebooting!");
	         hcap.power.reboot({
               "onSuccess":function() {
		          _this.rebootTrying = 0;
                  trace( "Saver -- rebootTry Rebooted!");
               }, 
               "onFailure":function(f) {
                  trace("Saver -- rebootTry ErrorMessage = " + f.errorMessage);
				  setTimeout( function( ) { _this.rebootTry( ); }, 30000 );  
               } 
            });
         }else{
            trace( "Saver -- rebootTry Waiting to Reboot");
            setTimeout( function( ) { _this.rebootTry( ); }, 30000 );   
         } 
      }, 
      "onFailure":function(f) {
         trace( "Saver -- rebootTry PowerMode No");
      }
   });
   
}
