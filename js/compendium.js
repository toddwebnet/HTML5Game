function Compendium(theme)
{
	trace( "In Compendium constructor" );
	this.initialize(theme);
}

Compendium.prototype.initialize = function( theme ) {
	trace( "Compendium Initialization" );	
	this.XML_Loaded = false;			
	this.PageList = new Array();	
	this.PreviousPages = new Array();
	this.yOrder_current = -1;
	this.yOrder_max = -1;
	this.MenuBackButtonCSS = "";
	this.MenuBackButtonLabel = "Go Back";
	this.preloadedImages = new Array();
	this.PreviousSelectedPages = new Array();

	this.LoadXML(theme);
	
	/*
	pop - remove last
	shift - remove first
	push - add to last
	unshift - add to first
	*/
	
}


Compendium.prototype.LoadXML = function( theme ) {
	_this = this;
	URL = theme + "/compendium.xml";
	$.ajax({
		type: "GET",
    url: URL,
		dataType: "xml",
    success: function( xml )
		{			
			_this.XML_Loaded = true;	
			_this.PageList = _this.convertXML(xml);
		}, 
		error: function( f ) 
		{
		  logMessage( "Compendium XML Not Loaded: " + f.errorMessage );
	  }
	});

}



Compendium.prototype.convertXML = function( sXML ) {
  
	//the meaning of CODE HELL!!!
	//converts xml to a "happy" object array
	// this is why JSON is so much BETTER!!!
	//of course I found out later that JQuery.each() is not ascyncronous (is sync)
	//but who wants to rewrite anyway?

	var tempArray = new Array();
	var oCompendium=sXML.documentElement.childNodes;	
	for(var i=0;i<oCompendium.length;i++)
	{
		//COPENDIUM NODE
		if(oCompendium[i].nodeType == 1 && oCompendium[i].nodeName == "MenuBackButtonCSS")//Pages Node
			{this.MenuBackButtonCSS = oCompendium[i].textContent;}
		if(oCompendium[i].nodeType == 1 && oCompendium[i].nodeName == "MenuBackButtonLabel")//Pages Node
			{this.MenuBackButtonLabel = oCompendium[i].textContent;}
		
		if(oCompendium[i].nodeType == 1 && oCompendium[i].nodeName == "pages")//Pages Node
		{
			//PAGES NODE
			var oPages = oCompendium[i].childNodes;
			for(var j=0;j<oPages.length;j++)
			{			
				//PAGE NODE
				if(oPages[j].nodeName == "page")
				{
					
					oPage = oPages[j].childNodes;
					var objPage = 
					{
						pageID:       "", 
						parentPageID: "", 
						pageTitle:    "", 
						clockCSS:     "",
						clockBGCSS:   "",
						clockText:    "",
						orderID:      "", 
						pageBlocks:   new Array(),
					}					
					for(var k=0;k<oPage.length;k++)
					{						
						if(oPage[k].nodeType == 1)
						{	
							//PAGE BLOCKS NODE
							if(oPage[k].nodeName == "pageBlocks")
							{
								var tPageBlocksArray = new Array();								
								var oPageBlocks = oPage[k].childNodes;
								for(var m=0;m<oPageBlocks.length;m++)
								{
									//PAGE BLOCKS NODE loop
									if(oPageBlocks[m].nodeType == 1)
									{
										oPageBlock = oPageBlocks[m].childNodes;										
										var objBlock = 
										{
											blockType:              "", 
											blockCSS:               "", 
											blockContent:           "", 
											blockContentCaption:    "", 
											blockContentCaptionCSS: "", 
											showBackButton:         "",
											backButtonCSS:          ""
										};											
										for(var n=0;n<oPageBlock.length;n++)
										{
											if(oPageBlock[n].nodeType == 1)
												{objBlock = this.manipulatePageBlockObjectValue(objBlock, oPageBlock[n].nodeName, oPageBlock[n].textContent);}
										}
										objPage.pageBlocks.push(objBlock);				
									}
									// END PAGE BLOCKS NODE loop
								}
							}
							//END PAGE BLOCKS NODE
							else
							{
								objPage = this.manipulatePageObjectValue(objPage, oPage[k].nodeName, oPage[k].textContent);							
							}
						}					
					}						
					tempArray.push(objPage);
					//END PAGE NODE
				}				
			}
			//END PAGES NODE
		}
		//END COMPENDIUM NODE
	}	
	return this.sortCompendiumArray(tempArray);
	
}


Compendium.prototype.manipulatePageObjectValue = function (obj, name, val)
{
	
	switch(name)
	{
		case "pageID":
			obj.pageID = val;
			break;
		case "parentPageID":
			obj.parentPageID = val;
			break;
		case "pageTitle":
			obj.pageTitle = val;
			break;		
		case "orderID":
			obj.orderID = val;
			break;		
		case "clockCSS":
			obj.clockCSS = val;
			break;		
		case "clockBGCSS":
			obj.clockBGCSS = val;
			break;			
		case "clockText":
			obj.clockText = val;
			break;					
				
	}
	return obj;
}

Compendium.prototype.manipulatePageBlockObjectValue = function (obj, name, val)
{
	switch(name)
	{
		case "blockType":
			obj.blockType = val;
			break;
		case "blockCSS":
			obj.blockCSS = val;
			break;
		case "blockContent":
			obj.blockContent = val;
			break;								
		case "blockContentCaption":
			obj.blockContentCaption = val;
			break;
		case "blockContentCaptionCSS":
			obj.blockContentCaptionCSS = val;
			break;
		case "showBackButton":
			obj.showBackButton= val;
			break;		
		case "backButtonCSS":
			obj.backButtonCSS= val;
			break;							
	}
	return obj;
}

Compendium.prototype.sortCompendiumArray= function (obj)
{
	//sorts the compendium array all elements in order of OrderID 
	//(parents and children will fall in place when presented)
	var objReturn = new Array();
	//get Biggest OrderID
	var BiggestOrderID = 0;
	for(var x = 0; x<obj.length;x++)
	{		
		if(BiggestOrderID < obj[x].orderID )
			{BiggestOrderID = obj[x].orderID;}
	}
	for(var x=0;x<=BiggestOrderID;x++)
	{
		for(var y = 0; y<obj.length;y++)
		{
			if(obj[y].orderID == x)
			{

				objReturn.push(obj[y]);
			}
		}
	}
	delete obj;
	return objReturn;
}

Compendium.prototype.buildPage= function (PageID, blnStoreHistory)
{

	//clean up if first page --- otherwise we would have like a billion page 0's
	if(PageID == 0)
	{this.PreviousPages = new Array(0);blnStoreHistory=true;}

	if (typeof blnStoreHistory === 'undefined') 
	{blnStoreHistory = true;}
	if(blnStoreHistory)
		{this.PreviousPages.push(PageID);}	
	var ItemInQuestion = this.getPageByID(PageID);
	var Kids = this.getKidsByParentID(PageID);
	var blnHasKids = (Kids.length > 0)?true:false;
	var HTML = "";
	var yOrder = 1;
	var StopShowingBackButton = blnHasKids;
	if(blnHasKids)
	{
		//Build Menu
		HTML = "<div id=\"compendiumMenuList\"class=\"CompendiumMenu\">";

		HTML+= "<div id=\"mComendium_Parent\" class=\"menu-title\" target=\"Page_" + PageID + "\" >" + ItemInQuestion.pageTitle + "</div>";
		for(var x = 0 ;x<Kids.length;x++)
		{			
			var Selected;
			if(typeof this.PreviousSelectedPages[PageID] !== 'undefined')
			{Selected=(this.PreviousSelectedPages[PageID] == Kids[x].pageID)?"nav-selected":"";}
			else
			{Selected = (yOrder ==1)?"nav-selected":"";}

			
			HTML+= "<div id=\"mComendium_Child_" + Kids[x].pageID + "\" class=\"menu-item nav-item " + Selected + "\" data-id=\"" + PageID + "_" + Kids[x].pageID + "\"  target=\"Page_" + Kids[x].pageID + "\" yorder=\"" + yOrder + "\" xorder=\"1\">" + Kids[x].pageTitle + "</div>";
			yOrder++;
		}
		this.yOrder_current = 1;
		HTML+= "<div id=\"mComendium_MenuBackButton\" class=\"menu-item nav-item " + this.MenuBackButtonCSS + "\" data-id=\"-1_0\" target=\"Page_-1\" yorder=\"" + yOrder + "\" xorder=\"1\">" + this.MenuBackButtonLabel + "</div>";


		this.yOrder_max  = yOrder;
		
		HTML += "</div>";
	}

	for(var x=0;x<ItemInQuestion.pageBlocks.length;x++)
	{
		var tObj = ItemInQuestion.pageBlocks[x];		
		HTML+="<div class=\"" + tObj.blockCSS + "\"";
		if(tObj.blockType.toUpperCase() == "IMG")
			{HTML+="style=\"  background-image: url( '" + tObj.blockContent + "');\"";}
		HTML+=">";
		if(tObj.blockType.toUpperCase() == "TXT")
			{HTML+=this.formatText(tObj.blockContent);}
		if(this.interpretYes(tObj.showBackButton) && !StopShowingBackButton)
		{
			HTML+="<div class=\"" + tObj.backButtonCSS + "\">" + this.MenuBackButtonLabel + "</div>";
			StopShowingBackButton = true;
		}
		
		HTML += "</div>";		
		if(tObj.blockContentCaption.length>0)
		{
			var blockContentCaptionCSS = tObj.blockCSS + "Caption";
			if(tObj.blockContentCaptionCSS.trim().length>0)
				{blockContentCaptionCSS = tObj.blockContentCaptionCSS.trim();}
			HTML+="<div class=\"" + blockContentCaptionCSS + "\">";
			HTML+=this.formatText(tObj.blockContentCaption);
			HTML += "</div>";
		}

	}
	
	
	var clockCSS= "CompTimeAndDate CompTimeAndDatePos1";
	var clockBGCSS= "CompTimeAndDateBackground CompTimeAndDateBackgroundPos1";
	var clockText = "";
	
	if(ItemInQuestion.clockCSS.trim() !="")
		{clockCSS = ItemInQuestion.clockCSS.trim();}
	if(ItemInQuestion.clockBGCSS.trim() !="")
		{clockBGCSS = ItemInQuestion.clockBGCSS.trim();}
	if(ItemInQuestion.clockText.trim() !="")
		{clockText = ItemInQuestion.clockText.trim();}

	HTML+="<div id=\"timeAndDateBackground2\" class=\"" + clockBGCSS + "\">" + clockText + "</div>";
	HTML+="<div id=\"timeAndDate2\" class=\"" + clockCSS + "\"></div>";

	$("#compendiumContext").html(HTML);
	$("#timeAndDate2").html($("#timeAndDate").html());
	

}

Compendium.prototype.getPageByID = function (PageID)
{
	_this = this;	
	for(var x = 0;x<_this.PageList.length;x++)
	{		
		if(_this.PageList[x].pageID == PageID)
			{return _this.PageList[x];}
	}

}
Compendium.prototype.getKidsByParentID = function (ParentID)
{
	Kids = new Array();
	for(var x = 0;x<_this.PageList.length;x++)
	{
		if(_this.PageList[x].parentPageID == ParentID && _this.PageList[x].pageID != ParentID)
			{Kids.push(_this.PageList[x]);}
	}
	return Kids;
}

Compendium.prototype.navDirection = function (dir)
{
	_this = this;
	
	var dirChange = 0;
	switch(dir)
	{
		case "up":
		case "left":
			dirChange = -1;
		break;
		case "down":
		case "right":
			dirChange = 1;
		break;			
	}
	var yOrder = _this.yOrder_current + dirChange;
	if(yOrder > _this.yOrder_max)
		{yOrder = _this.yOrder_max;}
	if(yOrder < 1)
		{yOrder = 1;}
	$("#compendiumMenuList div.nav-selected").removeClass('nav-selected');
	
	$("#compendiumMenuList div.nav-item").each(function(){
		
		if ( $(this).attr("yOrder")  == yOrder)
			{
				var f = $(this).attr("data-id").split("_");
				_this.PreviousSelectedPages[f[0]] = f[1];								
				$(this).addClass('nav-selected');
			}
	});
	_this.yOrder_current = yOrder;
	
}

Compendium.prototype.deriveCurrentPageID = function ()
{
	if($("#compendiumMenuList div.nav-selected").length)
	{
	return $("#compendiumMenuList div.nav-selected").attr("target").replace("Page_", "");
	}
	else
	{return -1;}
}
Compendium.prototype.navBang = function ()
{
	var PageID = this.deriveCurrentPageID();	
	if(PageID == -1)
		{this.navBack();}
	else
		{this.buildPage(PageID);}	
}


Compendium.prototype.allowNavBack= function ()
{
	//using >1 because the main page counts as one	
	if(this.PreviousPages.length>1)
	{return true;}
	else
	{return false;}
}
Compendium.prototype.navBack = function ()
{	
	if(this.PreviousPages.length>1)
	{
		this.PreviousPages.pop();		
		PageID = this.PreviousPages[this.PreviousPages.length-1];		
		this.buildPage(PageID, false);
	}
	else
	{
		context.switchToContext(context.constant.WELCOME_PAGE);
	}
}

Compendium.prototype.formatText= function (text)
{
	return text.trim().split("\n").join("<BR/>");
}

Compendium.prototype.interpretYes= function(text)
{
	text = text.toUpperCase();
	if(text == "YES" || text == "Y")
		{return true;}
	else
		{return false;}
}

Compendium.prototype.preloadImages= function()
{
	for(var x = 0;x<_this.PageList.length;x++)
	{
		for(var y=0;y<_this.PageList[x].pageBlocks;y++)
		{
			if(_this.PageList[x].pageBlocks[y].blockType.toUpperCase() == "IMG")
			{
				var img = new Image();
				img.src = _this.PageList[x].pageBlocks[y].blockContent ;
				this.preloadedImages.push(img);
			}
		}
	}
	
}