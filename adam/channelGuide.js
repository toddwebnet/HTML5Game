
/**********************************************
 * channelGuide.js
 *
 * builds and maintains the channel guide
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   10/07/2014   Initial version
 **********************************************/

"use strict";

function ChannelGuide( ) {
   trace( "ChannelGuide constructor" );
}

ChannelGuide.prototype.initialize = function( ) {
   trace( "ChannelGuide.initialize" );
   this.channelBannerDelay = 4000; /* will be overlayed with config value if it exists */
   this.channel = new Array( );
   this.guideApp = new Array( );
   this.guideData;
   this.channelGuideDisplayedMinutes;
   this.channelGuideDurationMinutes;
   this.channelGuideChannels;
   this.channelGuideTimeIncrementMinutes;
   this.channelGuideCellSpacing;
   this.currentChannelGuideStartTime
   this.currentChannelGuideStartChannelIX;
   this.maxGuideDataEndTime;
   this.minGuideDataStartTime;
   this.currentChannelBannerHideTOID;
   this.buildingGuide = false;
   this.showApplications = true;
   this.numApps = -1;

   this.guideTimeInternalFormat = "YYYYMMDDHHmm";
   this.dbTimeFormat = "YYYY-MM-DD HH:mm:ss";
   this.timeDisplayFormat = "h:mma";
   this.dateDisplayFormat = "MMMM D";
}

/* returns the index into the channel array for the given logical channel */
ChannelGuide.prototype.getChannelIX = function( logicalChannel ) {

   var found = false;
   var channelIX;

   for ( var i=0; i < this.channel.length && !found; i++ ) {
      if ( this.channel[ i ].logicalChannel == logicalChannel ) {
         found = true;
         channelIX = i;
      }
   }

   return channelIX;
}

/* request and load guide data. Assumption is data is sorted by time / channel */
ChannelGuide.prototype.load = function( channelLineupXml, guideXml ) {
   this.guideData = new Array( );
   this.channel = new Array( );
   this.guideApp = new Array( );
   this.maxGuideDataEndTime = '197001010000'; 
   this.minGuideDataStartTime = '240012312359'; 

   var houseChannel = false;

   var ok = true;

   var _this = this;

   /* first load the channel lineup data */
   $( channelLineupXml ).find( "channel" ).each( function( ) {
      var logicalChannel;
      var channelID;
      var channelName;
      var displayName;
      var channelIcon;
      $( this ).find( "logicalChannel" ).each( function( ) {
         logicalChannel = parseInt( $( this ).text( ) );
      });
      $( this ).find( "channelName" ).each( function( ) {
         channelName = $( this ).text( );
      });
      $( this ).find( "displayName" ).each( function( ) {
         displayName = $( this ).text( );
      });
      $( this ).find( "channelIcon" ).each( function( ) {
         channelIcon = $( this ).text( );
         if ( channelIcon > '' ) {
            channelIcon = displayStructure.imageFolder + channelIcon;
         }
      });
      $( this ).find( "channelID" ).each( function( ) {
         channelID = $( this ).text( );
      });

      if ( channelID > 0 ) {
         _this.channel.push( { "logicalChannel" : logicalChannel 
                         ,"channelName" : channelName
                         ,"displayName" : displayName
                         ,"channelIcon" : channelIcon
                        } 
                      );
      }
      else {
         if ( channelID == "APP" ) { /* this is an application */
            var applicationName;

            $( this ).find( "application" ).each( function( ) {
               applicationName = $( this ).text( );
            });
            /* see if it exists in the preloaded applications list */
            var found = false;
            /* sorry for the brute force here */
            for ( var i=0; i < display.property.application.length && !found; i++ ) {
               if ( display.property.application[ i ].title == applicationName ) {
                  found = true;
                  _this.guideApp.push( { "logicalChannel" : logicalChannel 
                                        ,"channelName" : channelName
                                        ,"displayName" : displayName
                                        ,"channelIcon" : channelIcon
                                        ,"applicationIX" : i
                                       } );
               }
            }
         }
         else {
            if ( channelID == 0 ) { /* welcome channel - house channel */
               _this.channel.push( { "logicalChannel" : logicalChannel 
                                     ,"channelName" : channelName
                                     ,"displayName" : displayName
                                     ,"channelIcon" : channelIcon
                                    } 
                                  );

               /* create first record in guide data */
               var channelIX = _this.channel.length - 1;
               _this.guideData.push( { startTime: "0" /* will adjust these at the end */
                                       ,endTime: "0"
                                       ,channelIX: channelIX
                                       ,logicalChannel: logicalChannel
                                       ,channelName: channelName
                                       ,programName: displayName
                                       ,programDescription: ""
                                       ,showTime: false
                                       ,showChannelName: false
                                      } );
               
               houseChannel = true;
            }
         } 
      }
   });

	 

   $( guideXml ).find( "result" ).each( function( ) {
      var result = $( this ).text( );
      if ( result != "OK" ) {
         logMessage( "Error loading guide data: " + result );
         ok = false;
      }
    });

   $( guideXml ).find( "guideData" ).each( function( ) {
      var gd = $.parseJSON( $( this ).text( ) );
      for ( var i=0; i < gd.length; i++ ) {
         /* store the guide data in the array for everything at or after the current date and time */
         /* get current date and time */
         var currentDateTime = moment( ).format( this.guideTimeInternalFormat );
         var maxTime = _this.addMinutesToGuideTime( currentDateTime, _this.channelGuideDurationMinutes );

         var startTime = gd[ i ].startDate + gd[ i ].startTime;
         var endTime = gd[ i ].endDate + gd[ i ].endTime;
         if ( endTime > _this.maxGuideDataEndTime ) {
            _this.maxGuideDataEndTime = endTime;
         }

         if ( startTime < _this.minGuideDataStartTime ) {
            _this.minGuideDataStartTime = startTime;
         }
         
         if ( endTime >= currentDateTime /* && startTime < maxTime */ ) { /* note: parsing guide data for all the duration sent over */
            /*store the item. NOTE: It is assumed and expected that the guide data comes to us in 
               logical channel, start time sorted order */

            var logicalChannel = parseInt( gd[ i ].logicalChannel );
            var channelIX = _this.getChannelIX( logicalChannel );
            if ( channelIX != undefined ) {
               _this.guideData.push( { startTime: startTime
                                 ,endTime: endTime
                                 ,channelIX: channelIX
                                 ,logicalChannel: logicalChannel
                                 ,channelName: _this.channel[ channelIX ].channelName
                                 ,programName: gd[ i ].title
                                 ,programDescription: gd[ i ].description
                                 ,showTime: true
                                 ,showChannelName: true 
                                } );							 
            }
         }
      }
   });

   /* if there is a house channel, adjust the first element in the guide to encompass all times */
   if ( houseChannel ) {
      this.guideData[ 0 ].startTime = this.minGuideDataStartTime;
      this.guideData[ 0 ].endTime = this.maxGuideDataEndTime;
   }
}

ChannelGuide.prototype.build = function( startTime ) {

   this.buildingGuide = true;
   $( "#channelGuide .nav-item" ).removeClass( "nav-item" );
   $( "#channelGuidePrograms" ).html( '' ); /* initialize this */
   /* from start time, build time increments */
   /* figure out how many time slots */
   var timeSlots = Math.floor( this.channelGuideDisplayedMinutes / this.channelGuideTimeIncrementMinutes );

   /* store the current channel guide start time */
   this.currentChannelGuideStartTime = startTime;

   /* display the start date */
   $( "#channelGuideDate" ).html( this.convertGuideTimeToDateStr( startTime ) );
   
   var t = startTime;
   var horizontalWidth = 0;

   var cSpace = parseInt( this.channelGuideCellSpacing.replace( /\D/g, '' ) );

   /* display the time row at the top */
   for ( var i=0; i < timeSlots; i++ ) {
      var slot = i+1;
      slot = ( slot < 10 ? "0" : "" ) + slot;
      $( "#channelGuideTime" + slot ).html( this.convertGuideTimeToTimeStr( t ) );
      $( "#channelGuideTime" + slot ).attr( "startTime", t );

      /* calculate next slot */
      t = this.addMinutesToGuideTime( t, this.channelGuideTimeIncrementMinutes );
      
      /* compute the total horizontal width of the area under the times */
      var w = $( "#channelGuideTime" + slot ).css( "width" );
      w = w.replace( /\D/g, '' ); /* remove non-numeric characters */
      w = parseInt( w ); /* convert to integer */
      horizontalWidth += ( horizontalWidth > 0 ? cSpace : 0 ) + w;
   }

   /* show app and channel lineup */
   var startChannelIX;

   if ( this.currentChannelGuideStartChannelIX != undefined ) {
      startChannelIX = this.currentChannelGuideStartChannelIX;
   }
   else {
      startChannelIX = 0; /* start at the top */
   }

   var adjChannelGuideChannels = this.channelGuideChannels;
   var channelSlot = 0;

   /* to ensure that only real applications are shown, go through the guideApps
    * and make sure they have underlying applications. This will only happen the first
    * time through */
   var numApps;

   if ( this.numApps < 0 ) {
      numApps = 0;
      for ( var i = 0; i < this.guideApp.length; i++ ) {
         if ( display.property.application[ this.guideApp[ i ].applicationIX ].id > 0 ) {
            numApps++;
         }
      }

      this.numApps = numApps; /* store this for use elsewhere */
   }
   else {
      numApps = this.numApps;
   }

   if ( this.showApplications ) {  /* show guide apps at the bottom of the guide */
      adjChannelGuideChannels -= numApps
   }

   /* make sure we don't show empty space below the last channel 
    * Removed as part of the plan to continue to roll the guide */
   /*  if ( startChannelIX + adjChannelGuideChannels > this.channel.length ) {
      startChannelIX = this.channel.length - adjChannelGuideChannels;
      if ( startChannelIX < 0 ) {
         startChannelIX = 0;
      }
   }*/

   this.currentChannelGuideStartChannelIX = startChannelIX;

   var slotHeight;
   var topLeft = 0;


   var curChan = startChannelIX;

   for ( var i=startChannelIX; i < ( startChannelIX + adjChannelGuideChannels ); i++ ) {
    // Marked
      
      if( curChan == this.channel.length ){
        curChan = 0;
      } 
    // Marked
      channelSlot++;
      var slotName = "#channelGuideChannel" + ( channelSlot < 10 ? "0" : "" ) + channelSlot;

      /* if slotHeight undefined, grab it from the current slot */
      if ( slotHeight == undefined ) {
         slotHeight = parseInt( $( slotName ).css( "height" ).replace( /\D/g, '' ) );
      }

      if ( curChan < this.channel.length && this.channel[ curChan ] != undefined ) {
         $( slotName ).html( "<span class=channelNumber>" + this.channel[ curChan ].logicalChannel + "</span>"
                           + "<span class=channelName>" + this.channel[ curChan ].displayName + "</span>" );
      }
      else {
         $( slotName ).html( '' );
      }
      curChan++;
   }
    // Marked
 //    if ( startChannelIX + adjChannelGuideChannels > this.channel.length ) {
 //     startChannelIX = this.channel.length - adjChannelGuideChannels;
 //     if ( startChannelIX < 0 ) {
 //        startChannelIX = 0;
 //     }
 //   }
    // Marked
   /* display the programs. Show apps at the bottom of the page */
   channelSlot = 0;
   curChan = startChannelIX;
   for ( var i=startChannelIX; i < ( startChannelIX + adjChannelGuideChannels ); i++ ) {
      if( curChan == this.channel.length ) {
         curChan = 0;
      }
      this.buildChannelSlots( curChan, channelSlot, startTime, slotHeight, horizontalWidth, cSpace );
      channelSlot++;
      curChan++;
   }

   /* now build any apps that are to be shown */
   if ( this.showApplications ) {
      var channelSlotSave = channelSlot;
      for ( var i=0; i < numApps; i++ ) {
         channelSlot++;
         slotName = "#channelGuideChannel" + ( channelSlot < 10 ? "0" : "" ) + channelSlot;

         $( slotName ).html( "" ); /* don't show as a channel name */
      }

      channelSlot = channelSlotSave;
      for ( var i=0; i < this.guideApp.length; i++ ) {
         if ( display.property.application[ this.guideApp[ i ].applicationIX ].id > 0 ) {
            this.buildApplicationSlot( i, channelSlot, slotHeight, horizontalWidth, cSpace )
            channelSlot++;
         }
      }
   }
   nav.gatherNavs( );
   this.buildingGuide = false;
}

ChannelGuide.prototype.buildChannelSlots = function( channelIX, channelSlot, startTime, slotHeight, horizontalWidth, cSpace ) {
   var prevEdge = -1;
   var programIX = this.locateProgramAtChannelAndTime( this.channel[ channelIX ].logicalChannel, startTime );
   if ( programIX != undefined ) {
      /* display that box and the rest of the programs for this channel until time runs out or the channel runs out */
      var processing = true;
      var count = 0;
      while ( processing ) {
         count++;
         if ( count > 100 ) {
            processing = false;
         }

				 
         var startTimeMins = this.convertGuideTimeToMinutes( this.ResetEndTimeIfTomorrow(startTime, this.guideData[ programIX ].startTime) );
         var endTimeMins = this.convertGuideTimeToMinutes( this.ResetEndTimeIfTomorrow(startTime, this.guideData[ programIX ].endTime) );
         /* TODO - shouldn't keep recomputing this line over and over */
         var baseStartTimeMins = this.convertGuideTimeToMinutes( startTime );

         if (   this.guideData[ programIX ].logicalChannel == this.channel[ channelIX ].logicalChannel 
             && endTimeMins >= baseStartTimeMins 
             && startTimeMins < ( baseStartTimeMins + this.channelGuideDisplayedMinutes ) ) {
								
            if ( endTimeMins > ( baseStartTimeMins + this.channelGuideDisplayedMinutes ) ) {
               endTimeMins = baseStartTimeMins + this.channelGuideDisplayedMinutes;							 
							 
            }

            if ( startTimeMins < baseStartTimeMins ) {							
               startTimeMins = baseStartTimeMins;
            }

            if ( startTimeMins < endTimeMins ) { /* must have a duration :-) */
               var top  = ( channelSlot * ( slotHeight + cSpace ) );
               var left;
               if ( prevEdge >= 0 ) {
                  left = prevEdge + cSpace;
               }
               else { 
                  left = 0;
               }
								
								

               var height = slotHeight;
               var width = ( Math.round( ( ( endTimeMins - startTimeMins ) / this.channelGuideDisplayedMinutes ) * horizontalWidth, 0 ) - cSpace );
							 
							 
							 width = this.channelGuideWidthTrim( left, width );
							 
               prevEdge = left + width;
            
               var xOrder = left; /* for setting the xOrder - provides the most accurate way of navigation up and down */
            
               /* add "px" to dimensions */
               top += "px";
               left += "px";
               height += "px";
               width += "px";
            
               /* create the slot and slot background, populate it with data, set the styles, and add to the channelGuide */
               var db = document.createElement( 'div' );
               var d = document.createElement( 'div' );
               $( db ).addClass( "programSlotBkg" );
               $( d ).addClass( "programSlot" );
               $( d ).addClass( "nav-item" );
               $( d ).attr( "yOrder", channelSlot );
               $( d ).attr( "xOrder", xOrder ); 
               $( d ).attr( "other", this.channel[ channelIX ].logicalChannel ); 
               $( d ).attr( "id", programIX );
               $( d ).attr( "target", "toChannel-" + this.channel[ channelIX ].logicalChannel  );
               $( d ).html( this.guideData[ programIX ].programName );
               $( db ).css( "position", "absolute" );
               $( d ).css( "position", "absolute" );
               $( db ).css( "top", top );
               $( db ).css( "left", left );
               $( db ).css( "height", height );
               $( db ).css( "width", width );
               $( d ).css( "top", top );
               $( d ).css( "left", left );
               $( d ).css( "height", height );
               $( d ).css( "width", width );
               
               $( "#channelGuidePrograms" ).append( db );
               $( "#channelGuidePrograms" ).append( d );
            }               
            programIX++;
            if ( programIX >= this.guideData.length ) {
               processing = false;
            }
         }
         else {
            processing = false;
         }
      }
   }
   /* fill in the slot with blank space if there is no guide information or if the guide doesn't reach to the right edge */
   if ( prevEdge < horizontalWidth ) {
      /* fill in the remainder */
      var top  = ( channelSlot * ( slotHeight + cSpace ) );
      var left;
      if ( prevEdge >= 0 ) {
         left = prevEdge + cSpace;
      }
      else { 
         left = 0;
      }
      var height = slotHeight;
      var width = horizontalWidth - left;
      var xOrder = left; /* for setting the xOrder - provides the most accurate way of navigation up and down */
      /* add "px" to dimensions */
      top += "px";
      left += "px";
      height += "px";
      width += "px";
   
      /* create the slot and slot background, populate it with data, set the styles, and add to the channelGuide */
      var db = document.createElement( 'div' );
      var d = document.createElement( 'div' );
      $( db ).addClass( "programSlotBkg" );
      $( d ).addClass( "programSlot" );
      $( d ).attr( "yOrder", channelSlot );
      $( d ).attr( "xOrder", xOrder ); 
      $( d ).attr( "other", this.channel[ channelIX ].logicalChannel ); 
      $( db ).css( "position", "absolute" );
      $( d ).css( "position", "absolute" );
      $( db ).css( "top", top );
      $( db ).css( "left", left );
      $( db ).css( "height", height );
      $( db ).css( "width", width );
      $( d ).css( "top", top );
      $( d ).css( "left", left );
      $( d ).css( "height", height );
      $( d ).css( "width", width );
      
      $( "#channelGuidePrograms" ).append( db );
      $( "#channelGuidePrograms" ).append( d );
   }
}

ChannelGuide.prototype.buildApplicationSlot = function( guideAppIX, channelSlot, slotHeight, horizontalWidth, cSpace ) {

   var top  = ( channelSlot * ( slotHeight + cSpace ) );
   var left = 0;
   var height = slotHeight;
   var width = horizontalWidth - cSpace;
   var xOrder = left; /* for setting the xOrder - provides the most accurate way of navigation up and down */
   var applicationIX = this.guideApp[ guideAppIX ].applicationIX;

   /* add "px" to dimensions */
   top += "px";
   left += "px";
   height += "px";
   width += "px";

   /* create the slot and slot background, populate it with data, set the styles, and add to the channelGuide */
   var db = document.createElement( 'div' );
   var d = document.createElement( 'div' );
   $( db ).addClass( "programSlotBkg" );
   $( d ).addClass( "programSlot" );
   $( d ).addClass( "nav-item" );
   $( d ).attr( "yOrder", channelSlot );
   $( d ).attr( "xOrder", xOrder ); 
   $( d ).attr( "id", "guideAPPIX-" + ( guideAppIX < 10 ? "0" : "" ) + guideAppIX );
   $( d ).attr( "target", "APP-" + applicationIX );
   if ( this.guideApp[ guideAppIX ].channelIcon ) {
      $( d ).html( "<img src='" + this.guideApp[ guideAppIX ].channelIcon + "' />" );
   }
   else {
      $( d ).html( this.guideApp[ guideAppIX ].displayName );
   }
   $( db ).css( "position", "absolute" );
   $( d ).css( "position", "absolute" );
   $( db ).css( "top", top );
   $( db ).css( "left", left );
   $( db ).css( "height", height );
   $( db ).css( "width", width );
   $( d ).css( "top", top );
   $( d ).css( "left", left );
   $( d ).css( "height", height );
   $( d ).css( "width", width );
   
   $( "#channelGuidePrograms" ).append( db );
   $( "#channelGuidePrograms" ).append( d );
}

/* will page the channel guide up or down based upon the direction passed */
ChannelGuide.prototype.scrollChannelGuide = function( direction, bottomOrTop ) {
   var currentTopChannelIX = this.currentChannelGuideStartChannelIX;
   var newTopChannelIX;
   var currentChannelTempStore;

   if ( bottomOrTop == undefined ) {
      bottomOrTop = "top";
   }

   switch ( direction ) {
      case "up" :
         /* calculate the top channel shown less number of channels shown, or 0, whichever is higher */
         newTopChannelIX = ( currentTopChannelIX - ( this.channelGuideChannels - ( this.showApplications ? this.numApps : 0 ) ) );
         if ( newTopChannelIX < 0 ) { 
            newTopChannelIX = this.channel.length + newTopChannelIX; 
         }

         if ( this.currentChannelGuideStartChannelIX == newTopChannelIX ) {
            /* no need to scroll. Highlight cell 1 in the top row */
            nav.navigateTo( 0 );
         }
         else {
            this.currentChannelGuideStartChannelIX = newTopChannelIX;
            /* since scrolling, don't have it set on current channel if that page happens to come up */
            currentChannelTempStore = display.property.channel;
            if ( bottomOrTop == 'top' ) {
               display.property.channel = newTopChannelIX;
            }
            else {
                
               /* figure out which channel would be at the bottom */
                var tempChan = newTopChannelIX + ( this.channelGuideChannels - ( this.showApplications ? this.numApps : 0 ) ) - 1;
               if(tempChan > this.channel.length) {
                    tempChan = tempChan - this.channel.length;
                }
               display.property.channel = this.channel[ tempChan  ].logicalChannel;
            }
            this.build( this.currentChannelGuideStartTime );
            display.property.channel = currentChannelTempStore;
         }

         break;

      case "down" :
         /* calculate the top channel shown plus number of channels shown, or max channel, whichever is lower */
         newTopChannelIX = ( currentTopChannelIX + ( this.channelGuideChannels - ( this.showApplications ? this.numApps : 0 ) ) );
     //    if ( newTopChannelIX < this.channel.length ) { 
           if( newTopChannelIX > this.channel.length ) {
                newTopChannelIX = newTopChannelIX - this.channel.length;
            }
            this.currentChannelGuideStartChannelIX = newTopChannelIX;
            /* since scrolling, don't have it set on current channel if that page happens to come up */
            currentChannelTempStore = display.property.channel;
            display.property.channel = -1;
            this.build( this.currentChannelGuideStartTime );
            display.property.channel = currentChannelTempStore;
     //    }
     //    else { /* just navigate to the last row */
     //    /* need to compute the first nav item in the last row */
     //       var found = false;
     //       var logicalChannel;
     //       /* REFACTOR: refactor this in the guide object */
     //       for ( var i= nav.items.length; i > 0 && !found; i-- ) {
               /* note: logical channel is the yOrder of each navigation item */
      //         var id = nav.items[ i-1 ].id; 
      //         if ( logicalChannel == undefined ) { /* first time through - grab the logical channel */
      //            logicalChannel = $( "#" + id ).attr( "yOrder" );
      //         }
      //         else {
      //            var lc = $( "#" + id ).attr( "yOrder" );
      //            if ( lc != logicalChannel ) {
      //               /* i represents the item we want to navigate to */
      //               nav.navigateTo( i );
      //               found = true;
      //            }
      //         }
      //      }
      //   }
         break;
   }
}


/* this will help line things up - returns a revised width if
   the width passed is within 5 pixels of a guide channel cell boundary */
ChannelGuide.prototype.channelGuideWidthTrim = function( left, width ) {

   /* compute possible edges from the time slots */
   var timeSlots = Math.floor( this.channelGuideDisplayedMinutes / this.channelGuideTimeIncrementMinutes );

   var edge = left + width;


   var adjusted = false;
   for ( var i=0; i < timeSlots && !adjusted; i++ ) {
      var slot = i+1;
      slot = ( slot < 10 ? "0" : "" ) + slot;

      var slotLeft = parseInt( $( "#channelGuideTime" + slot ).css( "left" ).replace( /\D/g, '' ) );
      var slotWidth = parseInt( $( "#channelGuideTime" + slot ).css( "width" ).replace( /\D/g, '' ) );
      var slotLeftAdjustment;
      if ( slot == 1 ) {
         /* compute the left of the first time slot to get this 0-based */
         slotLeftAdjustment = -slotLeft;
      }
      
      var slotEdge = slotLeft + slotWidth + slotLeftAdjustment;

      if ( Math.abs( edge - slotEdge ) < 5 ) {
         width += ( slotEdge - edge );
         adjusted = true;
      }

   }

   /* compute ending pixel of width */
   return width;
}

/* Guide Time is defined as a string that looks like this: yyyymmddhhmm */
ChannelGuide.prototype.convertGuideTimeToDateTime = function( gTime ) {

   return moment( gTime, this.guideTimeInternalFormat );
}

ChannelGuide.prototype.convertGuideTimeToTimeStr = function( gTime ) {
   return ( moment( gTime, this.guideTimeInternalFormat ).format( this.timeDisplayFormat ) );
}

ChannelGuide.prototype.convertGuideTimeToDBTimeStr = function( gTime ) {

   return ( moment( gTime, this.guideTimeInternalFormat ).format( this.dbTimeFormat ) );
}

ChannelGuide.prototype.convertGuideTimeToDateStr = function( gTime ) {

   return ( moment( gTime, this.guideTimeInternalFormat ).format( this.dateDisplayFormat ) );
}

ChannelGuide.prototype.addMinutesToGuideTime = function( gTime, addMinutes ) {

   var m = moment( gTime, this.guideTimeInternalFormat );

   return ( m.add( "minutes", addMinutes ).format( this.guideTimeInternalFormat ) );
}

ChannelGuide.prototype.subtractMinutesFromGuideTime = function( gTime, subtractMinutes ) {

   var m = moment( gTime, this.guideTimeInternalFormat );

   return ( m.subtract( "minutes", subtractMinutes ).format( this.guideTimeInternalFormat ) );
}


ChannelGuide.prototype.convertGuideTimeToMinutes = function( gTime ) {
   var h = Math.floor( gTime / 100 );
   var m = gTime - ( h * 100 );
   return ( h*60 + m );
}
ChannelGuide.prototype.ResetEndTimeIfTomorrow = function( sTime, eTime ) {

	var sDay = sTime.substring(0, 8);
	var eDay = eTime.substring(0, 8);

	if(eDay - sDay==1)
	{
		//parse out hour and minute
		var h = eTime.substring(8, 10);
		var m = eTime.substring(10,12)

		//add 24 hours
		h = parseInt(h) + 24; 

		//use the start day as the day and send a new "kind" of end time 
		return sDay + h + m;
	}
	else
	{return eTime;}


}


ChannelGuide.prototype.locateCurrentProgram = function( logicalChannel ) {
   logMessage( "locateCurrentProgram: Logical channel = " + logicalChannel );
   /* check for missing guide data */
   if ( this.guideData == undefined || this.guideData.length < 1 ) {
      return undefined;
   }

   var currentDateTime = moment( ).format( this.guideTimeInternalFormat );
   logMessage( "locateCurrentProgram: currentDateTime = " + currentDateTime );
   /* as always, apologies for the brute force - BR */
   var programIX = 0;
   var found = false;
   var processing = true;
   while ( processing ) { 
      if (    this.guideData[ programIX ].logicalChannel == logicalChannel 
           && this.guideData[ programIX ].startTime <= currentDateTime
           && this.guideData[ programIX ].endTime >= currentDateTime ) {
         found = true;
         processing = false;
      }
      else {
         programIX++;
         if ( programIX >= this.guideData.length ) {
            processing = false;
         }
      }
   }
   if ( found ) {
      return programIX;
   }
   else {
      logMessage( "Could not locate logicalChannel " + logicalChannel + " at " + currentDateTime + " in the channel guide" );
      return undefined;
   }
}

ChannelGuide.prototype.locateProgramAtChannelAndTime = function( logicalChannel, programTime ) {
   /* search the guide data for the logical channel, then find the nearest program time and return that index.
      IT IS ASSUMED that guide data is sorted by logical channel and time, in that order */
   /* as always, apologies for the brute force - BR */
   var programIX = 0;
   var found = false;
   var processing = true;
   while ( processing ) { 
      if ( programIX < this.guideData.length ) {
         if (    this.guideData[ programIX ].logicalChannel == logicalChannel 
              && this.guideData[ programIX ].startTime <= programTime
              && this.guideData[ programIX ].endTime >= programTime ) {
            found = true;
            processing = false;
         }
         else {
            programIX++;
         }
      }
      else {
         processing = false; /* did not find it */
      }
   }
   if ( found ) {
      return programIX;
   }
   else {
      logMessage( "Could not find logical channel " + logicalChannel + " for " + programTime );
      return undefined;
   }
}

/* returns true if there is a lower logical channel in the guide data */ 
ChannelGuide.prototype.channelExistsAbove = function( programIX ) {
   var logicalChannel = this.guideData[ programIX ].logicalChannel;
   var found = false;

   for ( var i=0; i < programIX; i++ ) {
      if ( this.guideData[ i ].logicalChannel < logicalChannel ) {
         found = true;
      }
   }

   return( found );
}

ChannelGuide.prototype.channelExistsBelow = function( programIX ) {
   var logicalChannel = this.guideData[ programIX ].logicalChannel;
   var found = false;

   for ( var i= this.guideData.length - 1; i > programIX; i-- ) {
      if ( this.guideData[ i ].logicalChannel > logicalChannel ) {
         found = true;
      }
   }

   return( found );
}

/* returns true if there is a program in the channel guide after the one specified 
   that has same logical channel */
ChannelGuide.prototype.programExistsToTheRight = function( programIX ) {
   var logicalChannel = this.guideData[ programIX ].logicalChannel;

   /* see if there is still room in the current program past the end of the currently displayed guide */
   if ( this.guideData[ programIX ].endTime > this.addMinutesToGuideTime( this.currentChannelGuideStartTime, this.channelGuideDisplayedMinutes ) ) {
      return true;
   }
   else {
      return ( this.guideData[ programIX + 1 ] != undefined &&
               this.guideData[ programIX + 1 ].logicalChannel == logicalChannel );
   }
}

ChannelGuide.prototype.programExistsToTheLeft = function( programIX ) {
   var logicalChannel = this.guideData[ programIX ].logicalChannel;
   var currentTime = moment( ).format( this.guideTimeInternalFormat );

   /* if the time in time slot 1 is in the past, don't scroll */
   var timeSlot1Time = $( "#channelGuideTime01" ).attr( "startTime" );
   if ( timeSlot1Time < currentTime ) {
      return false;
   }

   /* see if there is still room in the current program before the beginning of the currently displayed guide
      but not in the past */
   if ( this.guideData[ programIX ].startTime < this.currentChannelGuideStartTime ) {
      return true;
   }
   else {
      return ( this.guideData[ programIX - 1 ] != undefined &&
               this.guideData[ programIX - 1 ].logicalChannel == logicalChannel &&
               ( this.guideData[ programIX - 1 ].endTime > moment( ).format( this.guideTimeInternalFormat ) )
             );
   }
}
ChannelGuide.prototype.showChannelBanner = function( ) {

   var _this = this;
   /* show large channel banner if in television, smaller if in welcome page picture in graphic ("pig") */
   switch( context.currentContext ) {
      case context.constant.TELEVISION :
         /* to prevent channel banners disappearing quickly when moving through channels, cancel any pending hides */
         if ( this.currentChannelBannerHideTOID ) {
            clearTimeout( this.currentChannelBannerHideTOID );
         }
         var programIX = this.locateCurrentProgram( display.property.channel );
         if ( programIX != undefined ) {
            if (  this.channel[ this.guideData[ programIX ].channelIX ].channelIcon > '' ) {
               $( "#channelLogo" ).html( "<img src='" + this.channel[ this.guideData[ programIX ].channelIX ].channelIcon + "' />" );
            }
            else {
               $( "#channelLogo" ).html( this.channel[ this.guideData[ programIX ].channelIX ].displayName );
            }
            $( ".channel-title" ).html( this.guideData[ programIX ].programName );
            $( "#channelBannerNumber" ).html( display.property.channel );
            $( ".channel-short-description" ).html( this.guideData[ programIX ].programDescription );
            if ( this.guideData[ programIX ].showTime ) {
               $( ".channel-time-slot" ).html( this.convertGuideTimeToTimeStr( this.guideData[ programIX ].startTime ).replace( 'am','' ).replace( 'pm','' )
                                             + "-" + this.convertGuideTimeToTimeStr( this.guideData[ programIX ].endTime ) ); 
            }
            else {
               $( ".channel-time-slot" ).html( "" );
            }
            /* show the banner and set the timeout to hide it again in a little bit */
            $( "#channelBanner" ).show( );
            this.currentChannelBannerHideTOID = setTimeout( function( ) { _this.hideChannelBanner( "channelBanner" ); }, this.channelBannerDelay );
         }
         break;

      case context.constant.WELCOME_PAGE :
         /* to prevent channel banners disappearing quickly when moving through channels, cancel any pending hides */
         if ( this.currentChannelBannerHideTOID ) {
            clearTimeout( this.currentChannelBannerHideTOID );
         }
         var programIX = this.locateCurrentProgram( display.property.channel );
         if ( programIX != undefined ) {
            $( "#channelBannerSmall" ).html( "Channel " + display.property.channel + " - " + this.channel[ this.guideData[ programIX ].channelIX ].channelName );
   
            /* show the banner and set the timeout to hide it again in a little bit */
            $( "#channelBannerSmall" ).show( );
            this.currentChannelBannerHideTOID = setTimeout( function( ) { _this.hideChannelBanner( "channelBannerSmall" ); }, this.channelBannerDelay );
         }
         break;
   }
}

ChannelGuide.prototype.hideChannelBanner = function( cbID ) {

   switch( cbID ) {
      case "channelBanner" :
         $( "#" + cbID ).hide( );
         $( "#channelLogo" ).html( '' );
         $( ".channel-title" ).html( '' );
         $( ".channel-short-description" ).html( '' );
         $( ".channel-time-slot" ).html( '' )

         break;
      case "channelBannerSmall" :
         $( "#" + cbID ).hide( );
         $( "#channelBannerSmall" ).html( '' );

         break;
   }
}
