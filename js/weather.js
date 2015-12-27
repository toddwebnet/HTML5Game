/**********************************************
 * weather.js
 *
 * Interacts with the weather data coming from the ADAM server
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Dan Cousar     11/20/2014  Initial version
 **********************************************/

"use strict";

function Weather( ) {
   trace( "Weather Constructor" );
}

Weather.prototype.initialize = function( ) {
   trace( "Weather.initialize" );
   /* load Weather configuration */
   this.refreshDelay = 300000;
   this.locName = '';
   this.curTemp = '';
   this.curCond = '';
   this.dayImage = '';
   this.updateTime = '';
   this.imageFolder = displayStructure.imageFolder;
    
   this.requestWeatherData( );
   trace( "Initialized Weather ");

   var _this = this;
   
   document.getElementById('weather').innerHTML = "70.1&deg; <img src='" + _this.imageFolder + "weather/Day-Clear-Small.png'>";
   document.getElementById('weatherDay1Day').innerHTML = "Today";
   document.getElementById('weatherDay1Date').innerHTML = "Feb 11th";
   document.getElementById('weatherDay1Image').innerHTML = "<img src='" + _this.imageFolder + "weather/Day-Clear.png'>";
   document.getElementById('weatherDay1Cond').innerHTML = "Sunny";
   document.getElementById('weatherDay1High').innerHTML = "High: 73&deg;";
   document.getElementById('weatherDay1Low').innerHTML = "Low: 65&deg;";
   document.getElementById('weatherDay1Perc').innerHTML = "0 &#37;";
   document.getElementById('weatherDay2Day').innerHTML = "Thursday";
   document.getElementById('weatherDay2Date').innerHTML = "Feb 12th";
   document.getElementById('weatherDay2Image').innerHTML = "<img src='" + _this.imageFolder + "weather/ChanceOfStorms.png'>";
   document.getElementById('weatherDay2Cond').innerHTML = "Chance of a Thunderstorm";
   document.getElementById('weatherDay2High').innerHTML = "High: 73&deg;";
   document.getElementById('weatherDay2Low').innerHTML = "Low: 65&deg;";
   document.getElementById('weatherDay2Perc').innerHTML = "100 &#37;";
   document.getElementById('weatherDay3Day').innerHTML = "Friday";
   document.getElementById('weatherDay3Date').innerHTML = "Feb 13th";
   document.getElementById('weatherDay3Image').innerHTML = "<img src='" + _this.imageFolder + "weather/Overcast.png'>";
   document.getElementById('weatherDay3Cond').innerHTML = "Overcast";
   document.getElementById('weatherDay3High').innerHTML = "High: 73&deg;";
   document.getElementById('weatherDay3Low').innerHTML = "Low: 65&deg;";
   document.getElementById('weatherDay3Perc').innerHTML = "10 &#37;";
   document.getElementById('weatherDay4Day').innerHTML = "Saturday";
   document.getElementById('weatherDay4Date').innerHTML = "Feb 14th";
   document.getElementById('weatherDay4Image').innerHTML = "<img src='" + _this.imageFolder + "weather/ChanceOfRain.png'>";
   document.getElementById('weatherDay4Cond').innerHTML = "Chance of Rain";
   document.getElementById('weatherDay4High').innerHTML = "High: 73&deg;";
   document.getElementById('weatherDay4Low').innerHTML = "Low: 65&deg;";
   document.getElementById('weatherDay4Perc').innerHTML = "30 &#37;";
   
}

/* request Weather Data */
Weather.prototype.requestWeatherData = function( ) {
   var _this = this;
      display.sendData( "<clientData>"
                      + "<dataType>REQUEST_SEND_WEATHER</dataType>"
                      + "</clientData>" 
                      );
      /* make another request in the designated timeframe */
      setTimeout( function( ) { _this.requestWeatherData( ); }, _this.refreshDelay );
	  trace( "Requested Weather ");
   }

/* sets Weather data from results of Weather data request */
Weather.prototype.setWeatherData = function( xml ) {
   var welcomeWeather;
   var _this = this;
   var condSwitch;
   /* Grabbing Weather Info */
        $( xml ).find( "locName" ).each( function( ) {
               _this.locName = $( this ).text( );
            });
            $( xml ).find( "curTemp" ).each( function( ) {
               _this.curTemp = $( this ).text( );
            });
            $( xml ).find( "curCond" ).each( function( ) {
               condSwitch = $( this ).text( );
			   switch( condSwitch ){
			       case "sunny":
			       case "clear":
					_this.curCond = "<img src='" + _this.imageFolder + "weather/Day-Clear-Small.png'>";
					break;
				   case "nt_sunny":
			       case "nt_clear":
					_this.curCond = "<img src='" + _this.imageFolder + "weather/Night-Clear-Small.png'>";
					break;
				   case "mostlysunny":
				   case "partlysunny":
				   case "mostlycloudy":
				   case "partlycloudy":
				    _this.curCond = "<img src='" + _this.imageFolder + "weather/Day-PartlyCloudy-Small.png'>";
					break;
				   case "nt_mostlysunny":
				   case "nt_partlysunny":
				   case "nt_mostlycloudy":
				   case "nt_partlycloudy":
				    _this.curCond = "<img src='" + _this.imageFolder + "weather/Night-PartlyCloudy-Small.png'>";
					break;
				   case "fog":
				   case "nt_fog":
				   case "hazy":
				   case "nt_hazy":
				   case "cloudy":
				   case "nt_cloudy":
				   _this.curCond = "<img src='" + _this.imageFolder + "weather/Cloudy-Small.png'>";
				   break;
				   case "nt_chancetstorms":
				   case "chancetstorms":
				   case "nt_tstorms":
				   case "tstorms":
				   _this.curCond = "<img src='" + _this.imageFolder + "weather/Storms-Small.png'>";
				   break;
				   case "nt_chancerain":
				   case "chancerain":
				   case "nt_rain":
				   case "rain":
				    _this.curCond = "<img src='" + _this.imageFolder + "weather/Rain-Small.png'>";
					break;
				   case "nt_chancesleet":
				   case "chancesleet":
				   case "sleet":
				   case "nt_sleet":
				    _this.curCond = "<img src='" + _this.imageFolder + "weather/Sleet-Small.png'>";
					break;
				   case "chanceflurries":
				   case "nt_chanceflurries":
				   case "chancesnow":
				   case "nt_chancesnow":
				   case "flurries":
				   case "nt_flurries":
				   case "nt_snow":
				   case "snow":
				    _this.curCond = "<img src='" + _this.imageFolder + "weather/Snow-Small.png'>";
					break;
					default:
					_this.curCond = "<img src='" + _this.imageFolder + "weather/Overcast-Small.png'>";
					break;
				}
            });
            $( xml ).find( "updateTime" ).each( function( ) {
               _this.updateTime = $( this ).text( );
			});
			
			var days = $( xml ).find("dayInfo");
			var dayNum = 1;
			days.children('day').each(function(){
				var dayCond;
				document.getElementById('weatherDay'+dayNum+'Day').innerHTML = $(this).find("dayName").text();
				document.getElementById('weatherDay'+dayNum+'Date').innerHTML = $(this).find("dayDate").text();
			
				dayCond = $(this).find("dayIcon").text();
				switch( dayCond ){
			       case "sunny":
			       case "clear":
				   case "nt_sunny":
			       case "nt_clear":
					_this.dayImage = "<img src='" + _this.imageFolder + "weather/Day-Clear.png'>";
					break;
				   case "mostlysunny":
				   case "partlysunny":
				   case "mostlycloudy":
				   case "partlycloudy":
				   case "nt_mostlysunny":
				   case "nt_partlysunny":
				   case "nt_mostlycloudy":
				   case "nt_partlycloudy":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/Day-Cloudy.png'>";
				   break;
				   case "fog":
				   case "nt_fog":
				   case "hazy":
				   case "nt_hazy":
				   case "cloudy":
				   case "nt_cloudy":
					_this.dayImage = "<img src='" + _this.imageFolder + "weather/Overcast.png'>";
					break;
				   case "nt_chancesleet":
				   case "chancesleet":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/ChanceOfSleet.png'>";
				   break;
				   case "nt_chancerain":
				   case "chancerain":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/ChanceOfRain.png'>";
				   break;
				   case "nt_chancetstorms":
				   case "chancetstorms":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/ChanceOfStorms.png'>";
				   break;
				   case "nt_rain":
				   case "rain":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/RainCloud.png'>";
				    break;
				   case "nt_tstorms":
				   case "tstorms":
				    _this.dayImage = "<img src='" + _this.imageFolder + "weather/Thunderstorms.png'>";
					break;
				   case "chanceflurries":
				   case "nt_chanceflurries":
				   case "chancesnow":
				   case "nt_chancesnow":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/ChanceOfSnow.png'>";
				   break;
				   case "sleet":
				   case "nt_sleet":
				   _this.dayImage = "<img src='" + _this.imageFolder + "weather/Sleet.png'>";
				   case "flurries":
				   case "nt_flurries":
				   case "nt_snow":
				   case "snow":
				    _this.dayImage = "<img src='" + _this.imageFolder + "weather/Snow.png'>";
					break;
					default:
					_this.dayImage = "<img src='" + _this.imageFolder + "weather/Cloudy-Small.png'>";
					break;
				}
				
				document.getElementById('weatherDay'+dayNum+'Image').innerHTML = _this.dayImage;
				document.getElementById('weatherDay'+dayNum+'Cond').innerHTML = $(this).find("dayCond").text();
				document.getElementById('weatherDay'+dayNum+'High').innerHTML = "High: "+ $(this).find("dayHigh").text() + "&deg;";
				document.getElementById('weatherDay'+dayNum+'Low').innerHTML = "Low: "+ $(this).find("dayLow").text() + "&deg;";
				document.getElementById('weatherDay'+dayNum+'Perc').innerHTML = $(this).find("dayPerc").text() +"&#37;";
				dayNum++;
			});   			
                        _this.curTemp = Math.round(_this.curTemp);
			welcomeWeather = _this.curTemp + "&deg; " + _this.curCond;
            document.getElementById('weather').innerHTML = welcomeWeather;    
}
