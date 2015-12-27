/**********************************************
 * survey.js
 *
 * builds and processes the survey
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   10/23/2014  Initial version
 **********************************************/

"use strict";

function Survey( ) {
   trace( "Survey constructor" );
}

Survey.prototype.initialize = function( ) {
   trace( "Survey.initialize" );
   this.questions = 0;
}

Survey.prototype.loadSurvey = function( ) {
   var _this = this;

   $( "#surveyAnswers" ).html( '' ); /* clear out the survey answers if any have already been built */
   $( _themeConfigXml ).find( "survey" ).each( function( ) {
         var totalWidth = parseInt( $( "#surveyAnswers" ).css( "width" ).toLowerCase( ).replace( "px", "" ) );
         var surveyCellSpacing = 1;
         $( this ).find( "title" ).each( function( ) {
            $( "#surveyHeader" ).html( $( this ).text( ) );
         });
         $( this ).find( "surveyCellSpacing" ).each( function( ) {
            surveyCellSpacing = parseInt( $( this ).text( ).toLowerCase( ).replace( "px", "" ) );
         });
         var q = 0;
         $( this ).find( "question" ).each( function( ) {
            q++;
            var qNum = ( q < 10 ? "0" + q : q );
            var id = "#surveyQuestion" + qNum;
            $( this ).find( "text" ).each( function( ) {
               $( id ).html( $( this ).text( ) );
            });

            var questionXML = this;
            $( questionXML ).find( "type" ).each( function( ) {
               var qNum = ( q < 10 ? "0" + q : q );
               var id = "#surveyQuestion" + qNum;
               var heightID = "#surveyQuestionBkg" + qNum
               var height = parseInt( $( heightID ).css( "height" ).toLowerCase( ).replace( "px", "" ) );
               var option = new Array( );   
               switch ( $( this ).text( ) ) {
                  case "1to10" :
                     for ( var i=0; i < 10; i++ ) {
                        option.push( i + 1 );
                     }
   
                     break;

                  case "multipleChoice" :
                     $( questionXML ).find( "options" ).each( function( ) {
                        $( this ).find( "option" ).each( function( ) {
                           option.push( $( this ).text( ) );
                        });
                     });

                     break;
               }

               /* create navigable slots for the quesions */
               var top = ( q-1 ) * ( height + 1 );
               var options = option.length;
               if ( options > 0 ) {
                  /* create the options */
                  //var width = Math.floor( ( totalWidth - ( surveyCellSpacing * ( options - 1 ) ) ) / options );
                  var width = Math.round( totalWidth / options, 0 );
                  width -= surveyCellSpacing;
                  for ( var i=0; i<options; i++ ) {
                     var db = document.createElement( 'div' );
                     var d = document.createElement( 'div' );
                     $( db ).addClass( "answerSlotBkg" );
                     $( d ).addClass( "answerSlot" );
                     $( d ).addClass( "nav-item" );
                     $( d ).attr( "yOrder", q );
                     var id = "Q" + q + "-" + ( i + 1 );
                     $( d ).attr( "id", id );
                     $( d ).attr( "target", "selectAnswer-" + id );
                     $( d ).html( option[ i ] );
                     $( db ).css( "top", top );
                     $( d ).css( "top", top );
                     var left = ( i * ( width + surveyCellSpacing ) );
                     $( d ).attr( "xOrder", left );
                     if ( i == ( options - 1 ) ) {
                        var rightEdge = left + width;
                        width += ( totalWidth - rightEdge );
                     }

                     $( db ).css( "width", width + "px" );
                     $( d ).css( "width", width + "px" );
                     $( db ).css( "left", left + "px" );
                     $( d ).css( "left", left + "px" );

   
                     $( "#surveyAnswers" ).append( db );
                     $( "#surveyAnswers" ).append( d );
                  }
               }
            });
         });
         _this.questions = q; /* capture number of survey questions */
   });
}

Survey.prototype.markAnswer = function( id ) {

   /* get row number for this answer */
   var match = id.match( /Q([0-9]+)/ ); 
   if ( match != undefined && match.length == 2 ) {
      var rowNum = parseInt( match[ 1 ] );

      /* search each cell in this row number to see if any of them have the class of "is-answer" */
      $( "#survey .is-answer" ).each( function( ) {
         var match = $( this ).attr( "id" ).match( /Q([0-9]+)/ ); 
         if ( match != undefined && match.length == 2 ) {
            if ( parseInt( match[ 1 ] ) == rowNum ) {
               /* clear the is-answer class */
               $( this ).removeClass( "is-answer" );
            }
         }
      });
   }

   $( "#" + id ).addClass( "is-answer" );
}

/* submits the completed survey to the procentric server */
Survey.prototype.submitSurvey = function( ) {

   /* get each answer and create the submission string */
   var submissionString = "";

   var questionsAnswered = 0;
   $( "#survey .is-answer" ).each( function( ) {
      var id = $( this ).attr( "id" );
      /* parse out the row and answer for each */
      var match = id.match( /Q([0-9]+)\-([0-9]+)/ );
      if ( match != undefined && match.length == 3 ) {
         var questionNum = parseInt( match[ 1 ] );
         var answerNum = parseInt( match[ 2 ] );
         submissionString += ( submissionString > '' ? "|" : "" ) + questionNum + ":" + answerNum;
         questionsAnswered++;
      }
   });

   if ( questionsAnswered == this.questions ) {
      
      /* show the lightbox with a thankyou message */
      /* get thankyou message */
      var thankyouMessage = getThemeConfigValue( "thankyouMessage", true );
      $( "#lightbox" ).html( thankyouMessage );
      $( "#lightbox" ).attr( "nextContext", context.constant.WELCOME_PAGE ); /* will go to welcome page when they hit a key */
      $( "#lightboxBkg" ).show( );

      /* send the submission in */
      var submission = "<clientData>"
                    + "<dataType>SURVEY_SUBMITTED</dataType>"
                    + "<serialNumber>" + display.property.serialNumber + "</serialNumber>"
                    + "<surveyAnswers>" + submissionString + "</surveyAnswers>"
                    + "</clientData>";
   
      display.sendData( submission );
   }
   else {
      /* display a notice that they have to complete the survey */
      var surveyNotCompleteMessage = getThemeConfigValue( "surveyNotCompleteMessage", true );
      $( "#lightbox" ).html( surveyNotCompleteMessage );
      $( "#lightbox" ).attr( "nextContext", context.constant.SURVEY_PAGE ); /* will stay on survey page */
      $( "#lightboxBkg" ).show( );
   }
}
