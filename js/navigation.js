/**********************************************
 * navigation.js
 *
 * Controls navigation within the Adam application
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   10/07/2014   Initial version
 **********************************************/

"use strict";

function Navigation( ) {
   trace( "Navigation constructor" );
}

Navigation.prototype.initialize = function( ) {
   trace( "Navigation initialize" );
   this.items = new Array( );
   this.currentItem = 0;
   this.currentID;
}

Navigation.prototype.gatherNavs = function( navItemToGoTo ) { /*nav*/
   var divToSearch = new Array( );
   
   this.items = new Array( ); /* reset this */

   /* clear menu selected */
   $( ".nav-selected" ).removeClass( "nav-selected" );
   
   switch ( context.currentContext ) {
      case context.constant.WELCOME_VIDEO :
      case context.constant.INIT :
         divToSearch.push( "welcomeMenu" );
         break;
      case context.constant.WELCOME_PAGE_WITH_POPUP :
         divToSearch.push( "internetPopUp" );
         break;   
      case context.constant.WELCOME_PAGE :
         divToSearch.push( "welcomeMenu" );
         break;
      case context.constant.APPLICATIONS_PAGE :
         divToSearch.push( "preloadedApps" );
         break;
      case context.constant.GUIDE_PAGE :
         divToSearch.push( "channelGuide" );
         break;
      case context.constant.SURVEY_PAGE :
         divToSearch.push( "survey" );
         break;
      case context.constant.WEATHER_PAGE :
         divToSearch.push( "welcomeMenu" );
         break;
      case context.constant.COMPENDIUM_PAGE :
      default:
         divToSearch.push( menu.currentMenu );
         break;
   }

   for ( var i=0; i < divToSearch.length; i++ ) {
      var _this = this;

      $( "#" + divToSearch[ i ] + " .nav-item" ).each( function( ) {
         _this.items.push( { id: $( this ).attr( "id" )
                          ,xOrder: parseInt( $( this ).attr( "xOrder" ) )
                          ,yOrder: parseInt( $( this ).attr( "yOrder" ) )
                          ,target: $( this ).attr( "target" )
                          ,other: $( this ).attr( "other" )
                         } );
      });
   }

   switch( context.currentContext ) {

      case context.constant.GUIDE_PAGE :
         /* find first nav item on the current channel */
         /* note: don't override this with the navItemToGoTo value */
         var found = false;

         /* see if the current nav ID is visible, and if so select it */
         if ( this.currentID != undefined ) {
            for ( var i=0; i < this.items.length && !found; i++ ) {
               if ( parseInt( this.items[ i ].id ) == this.currentID ) {
                  found = true;
                  this.currentItem = i;
               }
            }
         }

         /* search for the first nav item for the current channel */
         if ( display.property.channel != undefined ) {
            for ( var i=0; i < this.items.length && !found; i++ ) {
               /* other holds logical channel number */
               if ( parseInt( this.items[ i ].other ) == display.property.channel ) {
                  found = true;
                  this.currentItem = i;
               }
            }
         }

         if ( !found ) {
            this.currentItem = 0;
         }

         break;

      default :
         if ( navItemToGoTo != undefined ) {
            this.currentItem = navItemToGoTo;
         }
         else {
            this.currentItem = 0;
         }
         break;
   }
   /* select the current nav item */
   this.navigateTo( this.currentItem );
}

/* locates the next nav item in the direction indicated */
Navigation.prototype.findNav = function( direction ) {/*nav*/

   /* check for an uninitialized state */
   if ( this.items == undefined || this.items.length == 0 
     || this.currentItem == undefined || this.currentItem > this.items.length ) {
      return 0;
   }
   
   /* get current nav item and position */
   var currentX = this.items[ this.currentItem ].xOrder;
   var currentY = this.items[ this.currentItem ].yOrder;
   var nextX;
   var nextY;
   var x;
   var y;
   var xDiff;
   var yDiff;
   var nextItem;

   for ( var i = 0; i < this.items.length; i++ ) {
      if ( i != this.currentItem ) { /* don't look at the item you're on */
         x = this.items[ i ].xOrder;
         y = this.items[ i ].yOrder;
         switch ( direction ) {
            case "up" :
               /* search for an item that has the next lower Y order and closest x order. No wrap-around (yet) */
               if (    y < currentY
                    && ( nextY == undefined || y >= nextY )
                    && ( yDiff == undefined || Math.abs( currentY - y ) <= yDiff ) ) {

                  if ( yDiff == undefined || Math.abs( currentY - y ) < yDiff ) { /* have found a closer row, clear the xDiff */
                     xDiff = undefined;
                  }

                  yDiff = Math.abs( currentY - y );
                  nextY = y;

                  if ( xDiff == undefined || Math.abs( currentX - x ) < xDiff ) {
                     xDiff = Math.abs( currentX - x );
                     nextX = x;
                     nextItem = i;
                  }
               }
               break;
            case "down" :
               /* search for an item that has the next higher Y order and closest x order */
               if (    y > currentY
                    && ( nextY == undefined || y <= nextY )
                    && ( yDiff == undefined || Math.abs( currentY - y ) <= yDiff ) ) {

                  if ( yDiff == undefined || Math.abs( currentY - y ) < yDiff ) { /* have found a closer row, clear the xDiff */
                     xDiff = undefined;
                  }

                  yDiff = Math.abs( currentY - y );
                  nextY = y;

                  if ( xDiff == undefined || Math.abs( currentX - x ) < xDiff ) {
                     xDiff = Math.abs( currentX - x );
                     nextX = x;
                     nextItem = i;
                  }
               }
               break;
            case "right" :
               /* search for an item that has the same Y order and next highest x order   
                  if a higher x order can't be found, look for the lowest x order for the next highest Y order */
               if (    y == currentY
                    && x > currentX
                    && ( nextX == undefined || x < nextX )
                    && ( xDiff == undefined || Math.abs( currentX - x ) <= xDiff )
                  ) {
                  xDiff = Math.abs( currentX - x );
                  nextX = x;
                  nextY = y;
                  nextItem = i;
               }     
               break;

            case "left" :
               /* search for an item that has the same Y order and next lowest x order */
               if (    y == currentY
                    && x < currentX
                    && ( nextX == undefined || x > nextX )
                    && ( xDiff == undefined || Math.abs( currentX - x ) <= xDiff )
                  ) {
                  xDiff = Math.abs( currentX - x );
                  nextX = x;
                  nextY = y;
                  nextItem = i;
               }     
               break;

            case "nextrowfront" :
               /* search for the item that has the next highest Y value and the lowest X value */
               if (    y > currentY
                    && ( nextX == undefined || x < nextX )
                    && ( yDiff == undefined || Math.abs( currentY - y ) <= yDiff )
                  ) {
                  yDiff = Math.abs( currentY - y );
                  nextX = x;
                  nextY = y;
                  nextItem = i;
               }     
               break;

            case "previousrowend" :
               /* search for the item that has the next lowest Y value and the highest X value */
               if (    y < currentY
                    && ( nextX == undefined || x >= nextX )
                    && ( yDiff == undefined || Math.abs( currentY - y ) <= yDiff )
                  ) {
                  yDiff = Math.abs( currentY - y );
                  nextX = x;
                  nextY = y;
                  nextItem = i;
               }     
               break;
         }
      }
   }
   if ( nextItem == undefined ) {
      nextItem = this.currentItem;
   }
   return nextItem;
}

Navigation.prototype.navUp = function( ) {/*nav*/

	if(context.currentContext == context.constant.COMPENDIUM_PAGE2)
		{compendium.navDirection("up");return;}

   var haveNavigated = false;

   var item = this.findNav( "up" );
   if ( item == this.currentItem ) { /* no where to go right */
      if ( context.currentContext == context.constant.GUIDE_PAGE ) { /* see if there are more programs to the right */

         channelGuide.scrollChannelGuide( "up", "bottom" );
         haveNavigated = true;

         /* note: the id of channel guide slots is the index in the channelGuide.guideData array */
         /* UNCOMMENT THIS CODE AND COMMENT OUT THE LINES ABOVE IF YOU WANT AN UP AT THE 
          * BOTTOM OF THE CHANNEL GUIDE TO NOT DO A FULL PAGE SCROLL, BUT JUST SHIFT ONE UP */
//         if ( channelGuide.channelExistsAbove( parseInt( this.items[ this.currentItem ].id ) ) ) {
//            channelGuide.currentChannelGuideStartChannelIX--; /* move to channel above */
//            channelGuide.build( channelGuide.currentChannelGuideStartTime );
//            item = this.findNav( "up" ); /* following the build, navigate up now that there is room */
//         }
      }
   }

   if ( !haveNavigated ) {
     this.navigateTo( item );
   }
}

Navigation.prototype.navDown = function( ) {/*nav*/
	if(context.currentContext == context.constant.COMPENDIUM_PAGE2)
		{compendium.navDirection("down");return;}
	
   var haveNavigated = false;

   var item = this.findNav( "down" );
   if ( item == this.currentItem ) { /* no where to go down */
      if ( context.currentContext == context.constant.GUIDE_PAGE ) { /* see if there are more programs to the right */

         channelGuide.scrollChannelGuide( "down", "top" );
         haveNavigated = true;
         
         /* note: the id of channel guide slots is the index in the channelGuide.guideData array */
         /* UNCOMMENT THIS CODE AND COMMENT OUT THE LINES ABOVE IF YOU WANT A DOWN AT THE 
          * BOTTOM OF THE CHANNEL GUIDE TO NOT DO A FULL PAGE SCROLL, BUT JUST SHIFT ONE DOWN */
//         if ( channelGuide.channelExistsBelow( parseInt( this.items[ this.currentItem ].id ) ) ) {
//            channelGuide.currentChannelGuideStartChannelIX++; /* move to channel below  */
//            channelGuide.build( channelGuide.currentChannelGuideStartTime );
//            item = this.findNav( "down" ); /* following the build, navigate down now that there is room */
//         }
      }
   }

   if ( !haveNavigated ) {
      this.navigateTo( item );
   }
}

Navigation.prototype.navRight = function( ) {
	if(context.currentContext == context.constant.COMPENDIUM_PAGE2)
		{compendium.navDirection("right");return;}
   var haveNavigated = false;

   var item = this.findNav( "right" );
   if ( item == this.currentItem ) { /* no where to go right */
      if ( context.currentContext == context.constant.GUIDE_PAGE ) { /* see if there are more programs to the right */

         /* note: the id of channel guide slots is the index in the channelGuide.guideData array */
         if ( channelGuide.programExistsToTheRight( parseInt( this.items[ this.currentItem ].id ) ) ) {
            channelGuide.build( channelGuide.addMinutesToGuideTime( channelGuide.currentChannelGuideStartTime, channelGuide.channelGuideTimeIncrementMinutes ) );
            haveNavigated = true; /* since channelGuide.build does the initial navigation */
         }
      }
      else { /* by default, go to the front of next row */
         item = this.findNav( "nextrowfront" );
      }
   }

   if ( !haveNavigated ) {
      this.navigateTo( item );
   }
}

Navigation.prototype.navLeft = function( ) {
	if(context.currentContext == context.constant.COMPENDIUM_PAGE2)
		{compendium.navDirection("left");return;}
   var haveNavigated = false;

   var item = this.findNav( "left" );
   if ( item == this.currentItem ) { /* no where to go left */
      if ( context.currentContext == context.constant.GUIDE_PAGE ) { /* see if there are more programs to the left */

         /* note: the id of channel guide slots is the index in the channelGuide.guideData array */
         if ( channelGuide.programExistsToTheLeft( parseInt( this.items[ this.currentItem ].id ) ) ) {
            channelGuide.build( channelGuide.subtractMinutesFromGuideTime( channelGuide.currentChannelGuideStartTime, channelGuide.channelGuideTimeIncrementMinutes ) );
            haveNavigated = true; /* since channelGuide.build does the initial navigation */
         }
      }
      else { /* by default, go to the back of the next row */
         item = this.findNav( "previousrowend" );
      }
   }

   if ( !haveNavigated ) {
      this.navigateTo( item );
   }
}

Navigation.prototype.navigateTo = function( item ) {/*nav*/
   /* reset the selected class on the current item */
   if ( this.items[ this.currentItem ] != undefined ) {
      var id = this.items[ this.currentItem ].id;
      $( "#" + id ).removeClass( "nav-selected" );
   }
   
   if ( this.items[ item ] == undefined ) {
      return;
   }

   id = this.items[ item ].id;
   $( "#" + id ).addClass( "nav-selected" );

   this.currentItem = item;
   this.currentID = this.items[ this.currentItem ].id;

   /* see if it has an image. If so, display the image in the context's image div */
   $( "#container .image-div" ).each( function( ) {
      if ( $( this ).is( ":visible" ) && $( this ).attr( "id" ) != id + "Image" ) {
//         $( this ).fadeToggle( "slow", "linear" );
         $( this ).hide( );
      }
      else {
         if ( $( this ).attr( "id" ) == id + "Image" ) {
//            $( this ).fadeToggle( "slow", "linear" );
            $( this ).show( );
         }
      }
   });

   /* see if it has an immediate target. If so, switch to that target */

   var iTarget = $( "#" + id ).attr( "immediateTarget" );
   if ( iTarget != undefined && iTarget != "undefined" ) {
      this.performNavigation( iTarget ); 
   }

   switch( context.currentContext ) {
      case context.constant.APPLICATIONS_PAGE:
         /* Display the application icon and the helper text in the currentApplication divs */
         var applicationIX = parseInt( $( "#" + id ).attr( "internalID" ) );
         if ( display.property.application[ applicationIX ].icon > '' ) {
            $( "#currentApp" ).html( "<img src='" + display.property.application[ applicationIX ].icon + "' />" );
         }
         else {
            $( "#currentApp" ).html( display.property.application[ applicationIX ].title );
         }

         $( "#currentAppInformation" ).html( display.property.application[ applicationIX ].helperText );
         break;

      case context.constant.GUIDE_PAGE :
         /* Display current channel information */
         var match = this.currentID.match( /guideAPPIX-([0-9]+)/ );
         if ( match != undefined && match.length == 2 ) {
            var guideAppIX = parseInt( match[ 1 ] );
            $( "#currentChannelTimeslot" ).html( "" ) 
            $( "#currentChannelChannelName" ).html( "<img src='" + channelGuide.guideApp[ guideAppIX ].channelIcon + "' />" );
            var applicationIX = channelGuide.guideApp[ guideAppIX ].applicationIX;
            $( "#currentChannelProgramName" ).html( display.property.application[ applicationIX ].title );
            $( "#currentChannelProgramDescription" ).html( display.property.application[ applicationIX ].helperText );
         }
         else {
            var programIX = parseInt( this.currentID );
            if ( channelGuide.guideData[ programIX ].showTime ) {
               $( "#currentChannelTimeslot" ).html( channelGuide.convertGuideTimeToTimeStr( channelGuide.guideData[ programIX ].startTime ).replace( 'am','' ).replace( 'pm','' ) 
                                             + " - " + channelGuide.convertGuideTimeToTimeStr( channelGuide.guideData[ programIX ].endTime ) ); 
            }
            else {
               $( "#currentChannelTimeslot" ).html( '' );
            }

            if (  channelGuide.channel[ channelGuide.guideData[ programIX ].channelIX ].channelIcon > '' ) {
               $( "#currentChannelChannelName" ).html( "<img src='" + channelGuide.channel[ channelGuide.guideData[ programIX ].channelIX ].channelIcon + "' />" );
            }
            else {
               if ( channelGuide.guideData[ programIX ].showChannelName ) {
                  $( "#currentChannelChannelName" ).html( channelGuide.channel[ channelGuide.guideData[ programIX ].channelIX ].displayName );
               }
               else {
                  $( "#currentChannelChannelName" ).html( "" );
               }
            }
            $( "#currentChannelProgramName" ).html( channelGuide.guideData[ programIX ].programName );
            $( "#currentChannelProgramDescription" ).html( channelGuide.guideData[ programIX ].programDescription );
         }
         break;

      case context.constant.SURVEY_PAGE : /* highlight the current question */
         /* first, clear any nav selected questions */
         $( "#survey .question-selected" ).each( function( ) {
            if ( $( this ).attr( "id" ) != this.currentID ) {
               $( this ).removeClass( "question-selected" );
            }
         });

         var match = this.currentID.match( /Q([0-9]+)/ );
         if ( match != undefined && match.length == 2 ) {
            var rowNum = parseInt( match[ 1 ] );
            var questionID = "surveyQuestion" + ( rowNum < 10 ? "0" : "" ) + rowNum;
            $( "#" + questionID ).addClass( "question-selected" );
         }

         break;
   }
   /* note: navigating anywhere while watching the welcome video will stop the video */
   if ( _welcomeVideoPlaying &&  !_welcomeVideoShutdownInProgress ) {
      context.contextSwitchPending = true;
      display.removeWelcomeVideo( );
   }   
}

Navigation.prototype.performNavigation = function( target ) {
	if(context.currentContext == context.constant.COMPENDIUM_PAGE2)
		{
		compendium.navBang();return;
		}
		
   switch ( target ) {
      case context.constant.TELEVISION :
         context.switchToContext( target );
         break;

      case "submitSurvey" :
         survey.submitSurvey( );
         break;

      case "exitSurvey" :

         this.navigateBackwards( );
         break;

      case "playWelcomeVideo" :

         display.playWelcomeVideo( );
         break;

      case "notImplemented" :
      case "undefined" :
         break;

      case "test" :
         test( );
         break;

      default :
         var match = target.match( /context:([a-zA-Z0-9]+)/ );
         if ( match != undefined && match.length == 2 ) {
            /* since this is a 'travel forward' event, push the current context and nav item on the stack */
            context.contextStack.push( context.currentContext, this.currentItem );
            context.switchToContext( match[ 1 ] );
         }
         else { /* see if it's an application load request */
            match = target.match( /APP-([0-9]+)/ );
            if ( match != undefined && match.length == 2 ) {
               display.launchApplication( parseInt( match[ 1 ] ) );
            }
            else { /* see if it's a toChannel request */
               match = target.match( /toChannel-([0-9]+)/ );
               if ( match != undefined && match.length == 2 ) {
                  display.gotoChannel( parseInt( match[ 1 ] ) );
               }
               else { /* see if it's a survey select answer request */
                  match = target.match( /selectAnswer-(Q[0-9]+-[0-9]+)/ );
                  if ( match != undefined && match.length == 2 ) {
                     survey.markAnswer( match[ 1 ] );
                  }
                  else { /* just attempt to switch to the target context */
                     context.switchToContext( target );
                  }
               }
            }
         }
         break;
   }
}

/* looks in the configuration for whatever the back-to value is and does that */
Navigation.prototype.navigateBackwards = function( ) {
	if(context.currentContext == context.constant.COMPENDIUM_PAGE2 && compendium.allowNavBack())
		{compendium.navBack();return;}
   if ( context.contextStack.length > 0 ) {
      var prevNavItem = context.contextStack.pop( );
      var prevContext = context.contextStack.pop( );
      /*** Note: we never want to go back to the weather forecast if we've navigated away from it. Hence this test below. BR and DC ***/
      if ( prevContext == context.constant.WEATHER_PAGE || prevContext == context.constant.WELCOME_PAGE_WITH_POPUP ) {
         prevContext = context.constant.WELCOME_PAGE;
      }
      context.switchToContext( prevContext, prevNavItem );
   }
   else {
      var goBack = getThemeConfigValue( "back-to", true );
   
      if ( goBack != undefined ) {
         this.performNavigation( goBack );
      }
   }
}

