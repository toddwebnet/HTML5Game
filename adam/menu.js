/**********************************************
 * menu.js
 *
 * builds menus
 *
 * Changes
 * Version  Who            When        What
 * 1.0      Bill Roberts   10/23/2014  Initial version
 **********************************************/

"use strict";

function Menu( ) {
   trace( "Menu constructor" );
}

Menu.prototype.initialize = function( context ) {
   trace( "Menu.initialize" );
   this.currentMenu = undefined;
}

/* reads all menu items from the theme config and builds menus */
Menu.prototype.buildAll = function( ) {
   var _this = this;

   this.menu = new Array( );

   $( _themeConfigXml ).find( "context" ).each( function( ) {
      var contextXML = this;
      $( contextXML ).find( "context-name" ).each( function( ) {
         var m = { };
         m.name = $( this ).text( );
         $( contextXML ).find( "image-x" ).each( function( ) {
            m.imageX = $( this ).text( );
         });
         $( contextXML ).find( "image-y" ).each( function( ) {
            m.imageY = $( this ).text( );
         });
         $( contextXML ).find( "image-w" ).each( function( ) {
            m.imageW = $( this ).text( );
         });
         $( contextXML ).find( "image-h" ).each( function( ) {
            m.imageH = $( this ).text( );
         });
         $( contextXML ).find( "context-menu" ).each( function( ) {
            $( this ).find( "menu-name" ).each( function( ) {
               m.menuName = $( this ).text( );
            });
            $( this ).find( "cssClass" ).each( function( ) {
               m.cssClass = $( this ).text( );
            });
            m.item = _this.build( this, m.menuName, m.cssClass );
            _this.menu.push( m );
         });
      });
   });

   for ( var i=0; i < this.menu.length; i++ ) {
      /* search for and build any image divs necessary */

      for ( var j=0; j < this.menu[ i ].item.length; j++ ) {
         /* create image div */
         if ( this.menu[ i ].item[ j ].image != undefined ) {
            var d = $( '<div/>' )
                  .attr( "id", this.menu[ i ].item[ j ].id + "Image" )
                  .css( "display", "none" )
                  .css( "position", "absolute" )
                  .css( "left", this.menu[ i ].imageX + "px" )
                  .css( "top", this.menu[ i ].imageY + "px" )
                  .css( "width", this.menu[ i ].imageW + "px" )
                  .css( "height", this.menu[ i ].imageH + "px" )
                  .css( "background-image", "url(" + this.menu[ i ].item[ j ].image + ")" )
                  .addClass( "image-div" );

            if ( this.menu[ i ].item[ j ].image != undefined ) {

            /* create image text div and append to image div */
               var t = $( '<div/>' )
                  .attr( "id", this.menu[ i ].item[ j ].id + "Text" )
                  .css( "position", "absolute" )
                  .css( "height", "50px" )
                  .css( "width", "600px" )
                  .css( "right", 0 )
                  .css( "bottom", 0 )
                  .addClass( "image-text-div" )
                  .html( this.menu[ i ].item[ j ].imageText );

               $( d ).append( t );
            }

            $( "#container" ).append( d );
         }
      }
   }
}

Menu.prototype.build = function( contextMenuXML, menuName, cssClass ) {

   var _this = this;
   var menu = new Array( );

   $( contextMenuXML ).find( "item" ).each( function( ) {
      var m = { };
      $( this ).find("label").each( function( ) {
         m.label = $( this ).text( );
      });
      $( this ).find("id").each( function( ) {
         m.id = $( this ).text( );
      });
      $( this ).find("target").each( function( ) {
         m.target = $( this ).text( );
      });
      $( this ).find("immediate-target").each( function( ) {
         m.immediateTarget = $( this ).text( );
      });
      $( this ).find("xOrder").each( function( ) {
         m.xOrder = $( this ).text( );
      });
      $( this ).find("yOrder").each( function( ) {
         m.yOrder = $( this ).text( );
      });
      $( this ).find("visible").each( function( ) {
         var visible = $( this ).text( ).toUpperCase( );
         if ( visible == 'N' || visible == 'NO' || visible == '0' ) {
            m.visible = false;
         }
         else {
            m.visible = true;
         }
      });
      $( this ).find("image").each( function( ) {

         m.image = $( this ).text( );
      });

      $( this ).find( "image-text" ).each( function( ) {
         m.imageText = $( this ).text( );
      });

      menu.push( m );
   });

   var html = "";
   for ( var i=0; i < menu.length; i++ ) {
      if ( menu[ i ].visible == undefined || menu[ i ].visible ) {
         html += "<div class='menu-item nav-item' "
              +  "xOrder='" + menu[ i ].xOrder + "' " 
              +  "yOrder='" + menu[ i ].yOrder + "' " 
              +  "target='" + menu[ i ].target + "' " 
              +  "immediateTarget='" + menu[ i ].immediateTarget + "' " 
              +  "id='" + menu[ i ].id + "' >" + menu[ i ].label + "</div>";
      }
   }

   /* setup the menu */
   $( '#container' ).append( "<div id='" + menuName + "' class='" + cssClass + "'>" + html + "</div>" );
   
   return menu;
}

/* locate the menu name for the given context */
Menu.prototype.locateName = function( context ) {
   
   for ( var i=0; i < this.menu.length; i++ ) {
      if ( this.menu[ i ].name == context ) {
         return ( this.menu[ i ].menuName );
      }
   }

   return( undefined );
}

/* show the menu, if any, for the given context */
Menu.prototype.show = function( context ) {
   var menuName = this.locateName( context );
   if ( menuName != undefined ) {
      $( "#" + menuName ).show( );
      this.currentMenu = menuName;
   }
   
}

/* hide the current menu, if any */
Menu.prototype.hideCurrent = function( ) {
   if ( this.currentMenu != undefined ) {
      $( "#" + this.currentMenu ).hide( );
      this.currentMenu = undefined;
   }
}

/* hide the menu, if any, for the given context */
Menu.prototype.hide = function( context ) {
   var menuName = this.locateName( context );
   if ( menuName != undefined ) {
      $( "#" + menuName ).hide( );
      this.currentMenu = undefined;
   }
}

