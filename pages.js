class Pages  {																					

	constructor()   																		// CONSTRUCTOR
	{
	}

	Draw(kmap)																				// DRAW KMAP PAGE
	{
		trace(kmap);
		this.DrawHeader(kmap);																	// Draw header
		if (kmap.asset_type == "Places")			sui.places.Draw(kmap);						// Show place
		else if (kmap.asset_type == "Sources") 		this.DrawSource(kmap);						// Source
		else if (kmap.asset_type == "Terms") 		this.DrawTerm(kmap);						// Term
		else if (kmap.asset_type == "Subjects") 	this.DrawSubject(kmap);						// Subject
		else if (kmap.asset_type == "Images") 		this.DrawIframe(kmap);						// Image
		else if (kmap.asset_type == "Audio-Video") 	this.DrawIframe(kmap);						// AV
		else if (kmap.asset_type == "Texts") 		this.DrawIframe(kmap);						// Text
		else if (kmap.asset_type == "Visuals") 		this.DrawIframe(kmap);						// Visual
	}

	DrawHeader(o)																			// DRAW HEADER
	{
		var i,j;
		var str=`${sui.assets[o.asset_type].g}&nbsp;&nbsp`;
		str+=(o.asset_type == "Places") ? o.title[0].toUpperCase() : o.title[0];				// Add title
		if (o.ancestors_txt && o.ancestors_txt.length > 1) {									// If has an ancestors trail
			str+="<div class='sui-breadCrumbs'>";												// Holds bread crumbs
			for (i=0;i<o.ancestors_txt.length-1;++i) {											// For each trail member
				str+=`<span class='sui-crumb' id='sui-crumb-${o.asset_type}-${o.ancestor_ids_is[i+1]}'>				
				${o.ancestors_txt[i]}</span>`;											
				if (i < o.ancestors_txt.length-2)	str+=" > ";									// Add separator
				}
			}
		$("#sui-headLeft").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div
		$("#sui-headRight").html("<span id='plc-closeBut' class='sui-resClose'>&#xe60f</span>");
		$("#sui-footer").html(`<div style='float:right;font-size:14px;margin-right:16px'>${o.asset_type.toUpperCase()} ID: ${o.id}</div>`);	// Set footer
		$("#sui-header").css("background-color",sui.assets[o.asset_type].c);					// Color header
		$("#sui-footer").css("background-color",sui.assets[o.asset_type].c);					// Color footer
		$("#plc-closeBut").on("click", ()=> { sui.Draw(); });									// Close handler
	
		$("[id^=sui-crumb-]").on("click",(e)=> {												// ON BREAD CRUMB CLICK
			var id=e.currentTarget.id.substring(10).toLowerCase();								// Get id
			sui.GetKmapFromID(id,(kmap)=>{ sui.SendMessage("",kmap); });						// Get kmap and show page
			});
	}

	DrawIframe(o)																				// DRAW AV PAGE FROM KMAP
	{
		var str=`<iframe id='sui-iframe' frameborder='0' 
		src='${o.url_html}' style='height:calc(100vh - 155px);width:100%'></iframe>`;	
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div	
	}

	DrawTerm(o)																				// DRAW TERM PAGE FROM KMAP
	{
		var latin=(typeof(o.name_latin) == "string" ) ? o.name_latin : o.name_latin.join(", ");
		var str=`<div class='sui-sources'>
		<span style='font-size:24px;color:${sui.assets[o.asset_type].c};vertical-align:-4px'>${sui.assets[o.asset_type].g}</span>
		&nbsp;&nbsp;&nbsp;&nbsp;<span class='sui-sourceText' style='font-size:20px;font-weight:500'>${o.title[0]}</span>
		<hr style='border-top: 1px solid ${sui.assets[o.asset_type].c}'>
		<p>TIBETAN:&nbsp;&nbsp<span class='sui-sourceText'>${o.name_tibt}&nbsp;&nbsp;(Tibetan script, original)</span></p>
		<p>LATIN:&nbsp;&nbsp<span class='sui-sourceText'>${latin}</span></p>
		<p>PHONEME:&nbsp;&nbsp<span class='sui-sourceText'>${o.data_phoneme_ss.join(", ")}</span></p>
		<p><span style='font-size:20px;vertical-align:-4px;color:${sui.assets[o.asset_type].c}'><b>&#xe60a</b></span>&nbsp;&nbsp;&nbsp;
		<select class='sui-termSpeak'><option>AMDO GROUP</option><option>KHAM-HOR GROUP</option></select></p>
		<hr style='border-top: 1px solid ${sui.assets[o.asset_type].c}'>
		<p>OTHER DICTIONARIES:&nbsp;&nbsp;</div>`;
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div	
	}

	DrawSubject(o)																			// DRAW SUBJECT PAGE FROM KMAP
	{
		var str=`<div class='sui-sources'>
		<span style='font-size:24px;color:${sui.assets[o.asset_type].c};vertical-align:-4px'>${sui.assets[o.asset_type].g}</span>
		&nbsp;&nbsp;&nbsp;&nbsp;<span class='sui-sourceText' style='font-size:20px;font-weight:500'>${o.title[0]}</span>
		<hr style='border-top: 1px solid ${sui.assets[o.asset_type].c}'>`
		str+="</div>";
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div	
	}

	DrawSource(o)																			// DRAW SOURCE PAGE FROM KMAP
	{
		var str=`<div class='sui-sources'>
		<span style='font-size:24px;color:${sui.assets[o.asset_type].c};vertical-align:-4px'>${sui.assets[o.asset_type].g}</span>
		&nbsp;&nbsp;<span class='sui-sourceText' style='font-size:20px;font-weight:500'>${o.title[0]}</span>
		<hr style='border-top: 1px solid #aaa'><br>`;
		if (o.creator && o.creator.length) {
			str+=`<span style='color:${sui.assets[o.asset_type].c}'>&#xe600</span>
			&nbsp;&nbsp;${o.creator.join(", ")}<br><br>`;
			}
		if (o.asset_subtype) str+="<p>FORMAT:&nbsp;&nbsp<span class='sui-sourceText'>"+o.asset_subtype+"</p>";
		if (!o.puYear)	o.pubYear="n/a";
		str+="<p>PUBLICATION YEAR:&nbsp;&nbsp<span class='sui-sourceText'>"+o.pubYear+"</span>";
		str+="<p>SOURCE ID:&nbsp;&nbsp<span class='sui-sourceText'>sources-"+o.id+"</span></p>";
		if (o.summary) str+="<p>ABSTRACT:<div class='sui-sourceText'>"+o.summary+"</div></p>";
		str+="</div>";
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div	
	}

	DrawImage(o)																			// DRAW IMAGE PAGE FROM KMAP
	{
		var str=`<div class='sui-imagesBox'>
		<div style='overflow:hidden;width:50%;'>
			<img src='${o.url_thumb.replace(/200,200/,"2000,2000")}'> 
		</div><br>
		<p>${sui.assets[o.asset_type].g}&nbsp;&nbsp;${o.title[0]}<br>
		${"Yeshi Wangchuk"} | ${"Photograph"} | ${"4000 x 3000"} px</p></div><br>
		<div class='sui-sources'>
		<div style='text-align:center'><b>&#xe633&nbsp;&nbsp;MANDALA COLLECTION</b>:&nbsp;&nbsp;${o.collection_title}</div>
		<hr style='border-top: 1px solid #b49c59;margin-top:12px'>
		<div style='width:calc(49% - 24px);border-right:1px solid #eee;display:inline-block;margin-right:24px;vertical-align:top;height:100%'>
		<p><b>${sui.assets[o.asset_type].g}&nbsp;&nbsp;TITLE</b>:&nbsp;&nbsp;${o.title[0]}</p>
		<p><b>&#xe600&nbsp;&nbsp;CREATOR</b>:&nbsp;&nbsp;${"Yeshi Wangchuk"}</p>
		<p><b>&#xe659&nbsp;&nbsp;TYPE</b>:&nbsp;&nbsp;${"Photograph"}</p>
		<p><b>&#xe663&nbsp;&nbsp;SIZE</b>:&nbsp;&nbsp;${"4000 x 3000 px"}</p>
		<p><b>PHOTOGRAPHER</b>:&nbsp;&nbsp;${"Yeshi Wangchuk (03/29/2015)"}</p>
		<p><b>ONLY DIGITAL</b>:&nbsp;&nbsp;${"Yes"}&nbsp;&nbsp;<b>COLOR</b>:&nbsp;&nbsp;${"Yes"}</p>
		<p><b>QUALITY</b>:&nbsp;&nbsp;${"Average"}&nbsp;&nbsp;<b>ROTATION</b>:&nbsp;&nbsp;${"0"}</p>

		</div>
		<div style='width:49%;display:inline-block;vertical-align:top'>
		<p><b>&#xe62B&nbsp;&nbsp;LOCATION</b>:&nbsp;&nbsp;${"Ugyenchhoeling"}</p>
		<p><b>&#xe634&nbsp;&nbsp;SUBJECT</b>:&nbsp;&nbsp;${"Bell"}</p>
		<p><b>&copy;&nbsp;&nbsp;COPYRIGHT HOLDER</b>:&nbsp;&nbsp;${"Copyright owned by Shejun and any other concerned organisation and individuals as per agreement with Shejun."}</p>
		<p><b>&copy;&nbsp;&nbsp;RIGHTS NOTES</b>:&nbsp;&nbsp;${""}</p>
		<p><b>ORIGINAL FILE</b>:&nbsp;&nbsp;${"BU_TANG_2017_08_26_OGYEN_CHOLING_MUSEUM_T_R3_070.jp2"}</p>
		<p><b>UPLOADED BY</b>:&nbsp;&nbsp;${"Sam Chrisinger"}</p>
		<p><b>LICENSE</b>:&nbsp;&nbsp;${"Creative Commons — Attribution-NonCommercial 4.0 International — CC BY-NC 4.0"}</p>
		
		</div>`;

	
	
	
/*	
		if (o.creator && o.creator.length) {
			str+=`<span style='color:${sui.assets[o.asset_type].c}'>&#xe600</span>
			&nbsp;&nbsp;${o.creator.join(", ")}<br><br>`;
			}
		if (o.asset_subtype) str+="<p>FORMAT:&nbsp;&nbsp<span class='sui-sourceText'>"+o.asset_subtype+"</p>";
		if (!o.puYear)	o.pubYear="n/a";
		str+="<p>PUBLICATION YEAR:&nbsp;&nbsp<span class='sui-sourceText'>"+o.pubYear+"</span>";
		str+="<p>SOURCE ID:&nbsp;&nbsp<span class='sui-sourceText'>sources-"+o.id+"</span></p>";
		if (o.summary) str+="<p>ABSTRACT:<div class='sui-sourceText'>"+o.summary+"</div></p>";
*/		str+="</div>";
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div	
	}


} // Pages class closure
