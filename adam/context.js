/**********************************************
 * context.js
 *
 * manages context in the application
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   10/07/2014   Initial version
 **********************************************/

"use strict";

function Context( ) {
   trace( "Context constructor" );
}

Context.prototype.initialize = function( ) {
   trace( "Context.initialize" );

   this.constant = {
      APP_INIT: "appInit"
     ,INIT: "init"
     ,TELEVISION: "television"
     ,WELCOME_PAGE_WITH_POPUP: "welcomePageWithPopup"
     ,WELCOME_PAGE: "welcomePage"
     ,COMPENDIUM_PAGE: "compendiumPage"
     ,GUIDE_PAGE: "guidePage"
     ,SURVEY_PAGE: "surveyPage"
     ,APPLICATIONS_PAGE: "applicationsPage"
     ,WELCOME_VIDEO: "welcomeVideo"
     ,WELCOME_VIDEO_WITH_DELAY: "welcomeVideoWithDelay"
     ,WEATHER_PAGE: "weatherPage"
     ,CREDENTIALS_PAGE: "credentialsPage"
		 ,COMPENDIUM_PAGE2: "compendiumPage2"
   }

   this.currentContext = this.constant.APP_INIT;
   this.contextStack = new Array( );
   this.contextSwitchPending = false;
   this.contextSwitchLoopCount = 0;
}

/**** context ***/
Context.prototype.switchToContext = function( context, navItem ) {
	
   var _this = this;
   /* ignore the switch to context if currently powered down (video panel is off) */
   if ( display.property.powerMode != display.constant.POWERMODE_ON ) {
      context = this.constant.INIT; /* set to init context */
      logMessage( "Setting to INIT context since power is currently not on" );
   }

   /* a check here - if switching from the welcome video to another context, need to wait
      until the welcome video is completely shut down, so if it isn't yet, schedule the switch for 
      a quarter second from now (to try again) */
   /* if not currently shutting down, shut it down */
   if ( _welcomeVideoPlaying &&  !_welcomeVideoShutdownInProgress ) {
      display.removeWelcomeVideo( );
      this.contextSwitchPending = true;
   }

   if ( _welcomeVideoPlaying || _welcomeVideoShutdownInProgress && contextSwitcLoopCount < 32 ) { /* video still playing or in the process of being shut down */
      /* wait a quarter of a second and try again */
      logMessage( "Will test if we can switch to context in .25 of a second" );
      this.contextSwitchLoopCount++;
      setTimeout( function( ) { _this.switchToContext( context ); }, 250 ); 
      return;
   }

   logMessage( "******** Switching contexts: From " + this.currentContext + " to " + context );
   this.contextSwitchPending = false; /* reset this in case it was set */
   this.contextSwitchLoopCount = 0; /* reset this too in case it was set */

   menu.hideCurrent( );

   switch( this.currentContext ) {
      case this.constant.INIT :
         display.muteVideo( );
         $( "#topBar" ).hide( );
         $( "#logo" ).hide( );
         $( "#welcomeBkg" ).hide( );
         $( "#videoCover" ).hide( );
         $( "#marketingArea" ).hide( );
         break;

      case this.constant.TELEVISION :
         $( "#channelBanner" ).hide( ); /* hide the channel banner when switching out of the TV in case it's showing */
         getChannelSubtitleIndex( true ); /* capture and clear the current channel subtitle index */
         break;
      
      case this.constant.WELCOME_PAGE_WITH_POPUP :
         $( "#channelBannerSmall" ).hide( ); /* hide the channel banner when switching out of the Welcome page in case it's showing */
         $( "#topBar" ).hide( );
         $( "#welcomeBkg" ).hide( );
         $( "#welcome" ).hide( );
         $( "#logo" ).hide( );
         $( "#marketingArea" ).hide( );
         $( "#internetPopUp" ).hide( );
         _marketingPopupSeen = true;
         pms.reportMarketingPopupSeen( );
         break;
         
      case this.constant.WELCOME_VIDEO :
      case this.constant.WELCOME_VIDEO_WITH_DELAY :
         $( "#topBar" ).hide( );
         $( "#welcomeBkg" ).hide( );
         $( "#welcome" ).hide( );
         $( "#logo" ).hide( );
         $( "#marketingArea" ).hide( );
         break;

      case this.constant.WELCOME_PAGE :
         $( "#channelBannerSmall" ).hide( ); /* hide the channel banner when switching out of the Welcome page in case it's showing */
         $( "#topBar" ).hide( );
         $( "#welcomeBkg" ).hide( );
         $( "#welcome" ).hide( );
         $( "#logo" ).hide( );
         $( "#marketingArea" ).hide( );
         break;

      case this.constant.APPLICATIONS_PAGE :
         $( "#videoCover" ).hide( );
         $( "#currentApp" ).hide( );
         $( "#currentAppInformation" ).hide( );
         $( "#preloadedApps" ).hide( );
         break;

      case this.constant.GUIDE_PAGE :
         $( "#topBar" ).hide( );
         $( "#logo" ).hide( );
         $( "#guideVideoCover" ).show( );
         $( "#videoCover" ).hide( );
         $( "#currentChannelContainer" ).hide( );
         $( "#channelGuide" ).hide( );
         break;

      case this.constant.SURVEY_PAGE :
         $( "#topBar" ).hide( );
         $( "#logo" ).hide( );
         $( "#videoCover" ).hide( );
         $( "#survey" ).hide( );
         $( "#surveyInformationBkg" ).hide( );
         $( "#surveyInformation" ).hide( );
         $( "#surveySidebar" ).hide( );
         break;
		 
      case this.constant.WEATHER_PAGE :
         $( "#topBar" ).hide( );
         $( "#logo" ).hide( );
         $( "#videoCover" ).hide( );
         $( "#welcomeBkg" ).hide( );
         $( "#welcome" ).hide( );
         $( "#weatherArea" ).hide( );
         $( "#marketingArea" ).hide( );
         break;
			case this.constant.COMPENDIUM_PAGE2 :
				 $( "#videoCover" ).hide( );
				 $( "#topBar" ).hide( );
         $( "#logo" ).hide( );
         $( "#marketingArea" ).hide( );
				 $( "#compendiumContext" ).hide( );
				 $("#timeAndDateBackground").show();
				 $("#timeAndDate").show();
				break;
		 
      /* because compendium pages can be dynamic, any unknown context
       * is assumed to be a compendium context */			
      case this.constant.COMPENDIUM_PAGE :
      default:
         $( "#topBar" ).hide( );
         $( "#logo" ).hide( );
         $( "#marketingArea" ).hide( );
         break;

   }

   this.currentContext = context;

   this.setContextVideoConditions( );
	
	 /*if(this.currentContext != this.constant.WELCOME_VIDEO)
	 {WelcomeVideoPause(true);}
	 */
   switch( this.currentContext ) {
      case this.constant.INIT :
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         $( "#logo" ).show( );
         $( "#welcomeBkg" ).show( );
         $( "#videoCover" ).show( );
         $( "#marketingArea" ).show( );
         break;

      case this.constant.TELEVISION :
         display.setTvMode( display.constant.TVMODE_TV );
         $( "#container" ).hide( );
         // REFACTOR THIS
         // setChannelSubtitleIndex( _currentChannelSubtitleIndex ); /* set the current channel subtitle index back up */         
         display.gotoTV( );
         break;

      case this.constant.WELCOME_PAGE_WITH_POPUP :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         /* clear the current context stack, as this is the initial entry point to the app */
         this.contextStack = new Array( );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         $( "#welcomeBkg" ).show( );
         $( "#welcome" ).show( );
         menu.show( this.constant.WELCOME_PAGE );
         $( "#logo" ).show( );
         $( "#marketingArea" ).show( );
         $( "#internetPopUp" ).show( ); 
         nav.gatherNavs( navItem );
         break;         
         
      case this.constant.WELCOME_VIDEO_WITH_DELAY :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         $( "#welcomeBkg" ).show( );
         $( "#welcome" ).show( );
         menu.show( this.constant.WELCOME_PAGE );
         $( "#logo" ).show( );
         $( "#marketingArea" ).show( );
         /* will start the welcome video playing after the delay */
         setTimeout( function( ) { _this.switchToContext( _this.constant.WELCOME_VIDEO ); }, _stbWelcomeVideoDelay );
         break;

      case this.constant.WELCOME_VIDEO :				
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         display.playWelcomeVideo( );
         $( "#topBar" ).show( );
         $( "#welcomeBkg" ).show( );
         $( "#welcome" ).show( );
         menu.show( this.constant.WELCOME_PAGE );
         $( "#logo" ).show( );
         $( "#marketingArea" ).show( );
         nav.gatherNavs( navItem );
         break;

      case this.constant.WELCOME_PAGE :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         /* clear the current context stack, as this is the initial entry point to the app */
         this.contextStack = new Array( );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         $( "#welcomeBkg" ).show( );
         $( "#welcome" ).show( );
         menu.show( this.constant.WELCOME_PAGE );
         $( "#logo" ).show( );
         $( "#marketingArea" ).show( );
         nav.gatherNavs( navItem );
         break;


      case this.constant.APPLICATIONS_PAGE :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#videoCover" ).show( );
         $( "#currentApp" ).show( );
         $( "#currentAppInformation" ).show( );
         display.showApplications( );
         nav.gatherNavs( navItem );
         break;
         
      case this.constant.CREDENTIALS_PAGE :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#videoCover" ).show( );
         $( "#currentApp" ).show( );
         $( "#currentAppInformation" ).show( );
         $( "#credentialsPopUp" ).show( );
         display.showApplications( );
         display.clearCredentials( );
         break;

      case this.constant.GUIDE_PAGE :
         $( "#container" ).show( );
         $( "#videoCover" ).show( );
         $( "#guideVideoCover" ).hide( );
         $( "#topBar" ).show( );
         $( "#logo" ).show( );
         $( "#currentChannelContainer" ).show( );

         /* compute start date for channel guide, rounding to nearest lower increment value */
         var m = moment( );
         var min = m.minute( );


         var diff = min % channelGuide.channelGuideTimeIncrementMinutes;

         min -= diff;

         m.minute( min );
         /* set the guide to show the page with the current channel in the middle, or at the top if it's the first channel */
         if ( display.property.channel != undefined ) {
            /* locate the channel in the channel array to get the current channel IX */
            var found=false;
            var cIX;
            for ( var i=0; i<channelGuide.channel.length && !found; i++ ) {
               if ( channelGuide.channel[ i ].logicalChannel == display.property.channel ) {
                  cIX = i;
                  found = true;
               }
            }

            if ( found ) {
               cIX -= Math.floor( channelGuide.channelGuideChannels / 2 );

               if ( cIX < 0 ) {
                  cIX = 0;
               }
               channelGuide.currentChannelGuideStartChannelIX = cIX;
            }
         }

         channelGuide.build( m.format( channelGuide.guideTimeInternalFormat ) );
         $( "#channelGuide" ).show( );
         display.setTvMode( display.constant.TVMODE_GUIDE ); /* switch to mode to trap chUp, chDn commands */
         break;

      case this.constant.SURVEY_PAGE :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         $( "#logo" ).show( );
         /* load the survey */
         survey.loadSurvey( );
         $( "#videoCover" ).show( );
         /* load survey information text */
         var informationMessage = getThemeConfigValue( "informationMessage", true );
         $( "#surveyInformationText" ).html( informationMessage );
         $( "#survey" ).show( );
         $( "#surveyInformationBkg" ).show( );
         $( "#surveyInformation" ).show( );
         $( "#surveySidebar" ).show( );
         nav.gatherNavs( navItem );
         break;
		 
      case this.constant.WEATHER_PAGE :
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         $( "#logo" ).show( );
         $( "#welcomeBkg" ).show( );
         $( "#welcome" ).show( );
		 menu.show( this.constant.WELCOME_PAGE );
		 $( "#videoCover" ).show( );
		 $( "#weatherArea" ).show( );
         $( "#marketingArea" ).show( );
         if ( !navItem ) {
            navItem = nav.currentItem;
         }
         nav.gatherNavs( navItem );
         break;

			case this.constant.COMPENDIUM_PAGE2 :
				 $("#timeAndDateBackground").hide();
				 $("#timeAndDate").hide();
				 $( "#videoCover" ).show( );
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         menu.show( this.currentContext );
         $( "#logo" ).show( );
				// no marketing areay
				//$( "#marketingArea" ).show( );
				 $( "#compendiumContext" ).show( );
				 if ( !navItem ) {
            navItem = nav.currentItem;
         }
				 compendium.buildPage(0);
         //nav.gatherNavs( navItem );
         break;
      
			/* because dynamic menus can spawn from the compendium page, the default action happens here */
      case this.constant.COMPENDIUM_PAGE :
      default:
         display.setTvMode( display.constant.TVMODE_PORTAL );
         $( "#container" ).show( );
         $( "#topBar" ).show( );
         menu.show( this.currentContext );
         $( "#logo" ).show( );
         $( "#marketingArea" ).show( );
         nav.gatherNavs( navItem );
         break;
   }
   /* reset the in context counter */
   _inContextCounter = -1;

   $( "#message" ).html( "Current context: " + context );
}

/* ensures the video settings (size and muting) for the current context are set */
Context.prototype.setContextVideoConditions = function( ) {
   switch( this.currentContext ) {
      case this.constant.TELEVISION :
         display.unMuteVideo( );
         break;

      case this.constant.WELCOME_VIDEO_WITH_DELAY :
         display.muteVideo( );
         break;

      case this.constant.WELCOME_VIDEO :
         initializePigVideo( );
         break;

      case this.constant.WELCOME_PAGE :
         initializePigVideo( );
         display.unMuteVideo( );
         break;

      case this.constant.APPLICATIONS_PAGE :
         initializeNullVideo( );
         display.muteVideo( ); /* mute the TV */
         break;

      case this.constant.GUIDE_PAGE :
         initializeGuideVideo( );
         display.unMuteVideo( );
         break;

      case this.constant.SURVEY_PAGE :
         display.muteVideo( ); /*  mute the TV */
         break;

      case this.constant.COMPENDIUM_PAGE :
      default :
         display.muteVideo( ); /* mute the TV */
         break;

   }
}

/**** context ***/
Context.prototype.switchToInitialContext = function( ) {
   /* reset the startup counter */
   _startUpCounter = -1;
	 //&& !_welcomeVideoAlreadyPlayed
   if ( _welcomeVideoURL && ( display.property.powerMode == display.constant.POWERMODE_ON ) ) {
      if ( display.property.modelName.match( /^STB/ ) && ( _stbWelcomeVideoDelay != undefined ) ) { /* if this is a set top box, include a delay before playing the video */
         this.switchToContext( this.constant.WELCOME_VIDEO_WITH_DELAY );
      }
      else { /* no delay */
         this.switchToContext( this.constant.WELCOME_VIDEO );
      }
   }
   else {
      if( !_marketingPopupSeen && _internetPopup){
         logMessage( "Debug: Showing Popup" );
         this.switchToContext( this.constant.WELCOME_PAGE_WITH_POPUP );
      } else {
         logMessage( "Debug: Not Showing Popup" );
         this.switchToContext( this.constant.WELCOME_PAGE );
      }
   }
}

