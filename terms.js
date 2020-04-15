/* 	TEERMS PAGES ****************************************************************************************************************************

	This module draws the terms page based on a kmap from SOLR. Some information comes from the kmap
	passed in and some from the a second query from the child data in the Terms index. 	The terms icon
	and the term are shown, followed by a list of names associated with that term.

	The related resources menu is drawn, which pulls data via another SOLR call. If an image is present
	it is drawn there. Below that is a browsable index of terms. Clicking on one will bring up that page.

	An button will appear if there is a recording associated with the term,found by a third query to SOLR.
	Clicking on it will play the various mp3 versions as available  and chosen by the pulldown menu.

	A tabbed menu shows the DEFINITIONS, whih lists the definition for that term, along with its language.
	The DETAILS tab lists the subjects to this page Hovering over a blue popover icon will show more information 
	about it. The OTHER DICTIONARIES tab shows definitions from other dictionaries.

	The tab will open to the DEFINATIONS tab is there are any, otehr wise it will open the OTHER DICTIONARIES
	tab, and fianlly the DETAILS tab

	Requires: 	jQuery 												// Almost any version should work
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	JSON:		From Drupal site
	Globals:	Looks for sui and sui.pages
	Dependents:	pages.js, searchui.js								// JS modules called

	
*********************************************************************************************************************************************/

class Terms  {																					

	constructor()   																		// CONSTRUCTOR
	{
		sui.trm=this;																			// Save context
		this.div=sui.pages.div;																	// Div to hold page (same as Pages class)
		this.recordingGroup=0;																	// Which group
		this.tabs=[];																			// Tab contents
		this.tagged=[];																			// Kmaps of tagged definitions
		this.kmap=null;																			// Current kmap
	}

	Draw(o)																					// DRAW TERM PAGE FROM KMAP
	{
		let audioURLs=[""];
		this.kmap=o;
		var str=`<div class='sui-terms' id='sui-terms' style=''>
		<span class='sui-termIcon'>${sui.assets[o.asset_type].g}</span>
		<span class='sui-termTitle' id='sui-termTitle'>${o.title[0]}</span>
		<hr style='border-top: 1px solid ${sui.assets[o.asset_type].c}'>
		<p id='sui-termNames'>Names</p>
		<div id='sui-player' style='display:none'>
		<p><span class='sui-termPlay' id='sui-termPlay'>&#xe60a</span>
		<select class='sui-termSpeak' id='sui-termGroup'><option>AMDO GROUP</option></select></p></div>`;
		str+="<div id='sui-termDetails'></div>";												// Add div for details

		str+="<div id='sui-termDefs' class='sui-termOther'></div>";								// Add div for primary defs
		str+="<br><div class='sui-termOHead'>OTHER DICTIONARIES</div>";							// Add other header
		str+="<div id='sui-termOther' class='sui-termOther' style='padding:0 24px'></div></div>";	// Add div for other dictionaries
		$(this.div).html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div	
		this.tabs=[];																			// Start fresh
		this.SetTabContent(o);																	// Fill tab contents

		$("#sui-termPlay").on("click", (e)=>{													// ON TERM PLAY
			let snd=new Audio();																// Init audio object
			snd=new Audio(audioURLs[this.recordingGroup]);										// Load it				
			snd.play();																			// Play it
			});

		$("#sui-termGroup").on("change", (e)=>{													// ON GROUP SET
			this.recordingGroup=$("#sui-termGroup").prop('selectedIndex');						// Get group
			});

		sui.GetAudioFromID(o.id, (d)=>{ 														// Get audio info
			audioURLs=d; 																		// Get urls
			if (d.length)		$("#sui-player").slideDown();									// If any recording, show structure
			if (d.length > 1)	$("#sui-termGroup").append("<option>KHAM-HOR GROUP</option>");	// Add 2nd group if there
			if (d.length > 2)	$("#sui-termGroup").append("<option>CENTRAL TIBET DIALECT</option>");	// Add 3rd group if there
			});											
		sui.pages.DrawRelatedAssets(o);															// Draw related assets menu
	}

	SetTabContent(o)																		// FILL TABS																
	{
		sui.GetChildDataFromID(o.uid,(odata)=> { 												// LOAD CHILD DATA
			let i,k=1,l=0,t;
			let str="<br>",str2="";
			let str3="<div style='height:2px'/>";												// Spacer
			let str4="<table>";
			let firstName="";																	// First name listed
			try { 
				let data=odata._childDocuments_;												// Point at data
				for (i=0;i<data.length;++i) {													// For each doc
					if (data[i].id.match(/_definitions-/)) {									// If a definition
						if (data[i].related_definitions_source_s) {								// If another dictionary
							str+="<div>"+(k++)+". <i>"+data[i].related_definitions_source_s+"</i></div>";	// Add title
							str+="<p style='font-size:14px;padding:0 24px;line-height:22px'>";
							str+=data[i].related_definitions_content_s;							// Add text
							str+="</p><div class='sui-termData'>";
							str+="<div class='sui-termData'>LANGUAGE: "+data[i].related_definitions_language_s;	// Add language
							str+="</div><hr style='border-top: 1px solid #a2733f'></div>";		// End rule and div
							}
						else{																	// A primary definition
							str2+=this.DrawTabMenu(l++,[l+".&nbsp;&nbsp;DEFINITION","RESOURCES","PASSAGES"]);	// Add tab menu
							t=["","<br>","<br>Waiting for data from Derik...<br><br><br><br>"] ;// New tab
							t[0]+="<div style='font-size:14px;padding:0 24px'>";
							t[0]+=data[i].related_definitions_content_s;						// Add text
							t[0]+="</div><div class='sui-termData'>";
							if (data[i].related_definitions_author_s) t[0]+="AUTHOR: "+data[i].related_definitions_author_s+" | ";						
							t[0]+="LANGUAGE: "+data[i].related_definitions_language_s+"</div><br><br>"; // Add language
							
							if (data[i]["related_definitions_branch_subjects-185_header_s"]) {	// If a header
								t[1]+=data[i]["related_definitions_branch_subjects-185_header_s"].toUpperCase();						// Add label
								t[1]+=": <i>"+data[i]["related_definitions_branch_subjects-185_subjects_headers_t"]+"</i>";				// Add value
								t[1]+=sui.pages.AddPop(data[i]["related_definitions_branch_subjects-185_subjects_uids_t"][0])+"<br>";	// Add popover
								}
							t[1]+="LANGUAGE: <i>"+data[i].related_definitions_language_s+"</i>";	
							t[1]+=sui.pages.AddPop(data[i]["related_definitions_branch_subjects-184_subjects_uids_t"][0])+"<br>";		// Add popover
							if (data[i]["related_definitions_branch_subjects-5855_header_s"]) {	// If a header
								t[1]+=data[i]["related_definitions_branch_subjects-5855_header_s"].toUpperCase();						// Add label
								t[1]+=": <i>"+data[i]["related_definitions_branch_subjects-5855_subjects_headers_t"]+"</i>";			// Add value
								t[1]+=sui.pages.AddPop(data[i]["related_definitions_branch_subjects-5855_subjects_uids_t"][0])+"<br>";	// Add popover
								}
							t[1]+="<br>";
							this.tabs.push(t);													// Add tab data for this def
							}
						}
					if (data[i].id.match(/_names-/)) {											// If a name
						if (!firstName) firstName=data[i].related_names_header_s;				// Save first name listed
						str4+=`<tr><td>> <b>${data[i].related_names_header_s}&nbsp;&nbsp;&nbsp;</b></td><td>
						<i>${data[i].related_names_language_s}, ${data[i].related_names_writing_system_s}, ${data[i].related_names_relationship_s}
						</i></td></tr>`;														// Add it
						}
					$("#sui-termNames").html(str4+"</table>");									// Add names
					$("#sui-termTitle").html(`${firstName}&nbsp;&nbsp;&nbsp;${o.title[0]}`);	// Add first
					}
				} catch(e) {}

			function drawAssetButton(facet, defNum, num) {
				let str=`<div id='sui-termAssetBut-${defNum}-${facet}'
					class='sui-termAssetBut' style='background-color:${sui.assets[facet].c}'>
					<span style='font-size:20px; vertical-align:-4px'>${sui.assets[facet].g}&nbsp;</span>${facet}&nbsp;&nbsp;
					(${num})</div>`;
					return str.replace(/\t|\n|\r/g,"");
				}
				
			sui.GetDefinitionAssets(o.uid, (data)=> {											// MAKE TAGGED RESOUCES BUTTONS
				let i,j,d,s,def,t=[];
				if (!data) 			return "";													// Quit if nothing tagged
				if (!data.length) 	return "";													// Quit if nothing tagged
				this.tagged=[];																	// Init tagged array
				for (i=0;i<this.tabs.length;++i) this.tagged.push([])							// For each def, add array
			
				for (i=0;i<data.length;++i) {													// For each result, get list of tagged assets
					d=data[i];																	// Point at it
					if (d.asset_type == "terms")	continue;									// Skip terms
					for (j=0;j<d.kmapid.length;++j) {											// Look through kmapids
						def=d.kmapid[j].match(/_definitions-(\d*)/i);							// A def?
						if (def) this.tagged[def[1]-1].push(d);									// Add kmap	if tied to a tag
						}
					}
	
				for (i=0;i<this.tabs.length;++i) {												// For each def, make button panel
					t.all=t.subjects=t.places=t.images=t.sources=t.visuals=t.collections=t.texts=t["audio-video"]=0;	// Reset counts
					for (j=0;j<this.tagged[i].length;++j) {										// For each tagged kmap in def
						t[this.tagged[i][j].asset_type]++;										// Update count
						t["all"]++;																// Update total count
						}
					s="";																		// Null title 
					for (j in t) {																// For each asset type	
						if (t[j]) {																// If anything tagged
							s="<b>Resources tagged with this definition: </b><br>"; 			// Add title
							break;																// Quit looking
							}
						}
					for (j in t) {																// For each asset type	
						if (t[j]) {																// If anything tagged
							s+=drawAssetButton(j,i,t[j]);										// Make button
							}
						}
					this.tabs[i][1]+=s;															// Add to definition tab
					}
				});

			str3="<table style='width:100%'><tr>"												// Add subject types
			addSubjects("PHONEME",o.data_phoneme_ss);											
			addSubjects("GRAMMARS",o.data_grammars_ss);											
			str3+="</tr><tr>"
			addSubjects("TOPICS",o.data_tibet_and_himalayas_ss);											
			addSubjects("LITERARY PERIOD",o.data_literary_period_ss);							
			str3+="</tr><tr>"
			addSubjects("REGISTER",o.data_register_ss);											
			addSubjects("LANGUAGE CONTEXT",o.data_language_context_ss);
			str3+="</tr></table>";
			$("#sui-termDetails").html(str3+"<br>");											// Add Details
			$("#sui-termDefs").html(str2.replace(/\t|\n|\r/g,""));								// Remove format and add primary defs to div	
			$("#sui-termOther").html(str.replace(/\t|\n|\r/g,""));								// Remove format and add others to div	
			for (i=0;i<l;++i) this.ShowTab(i,0)													// Open 1st tab	in each def	
			
			function addSubjects(title, val) {													// ADD SUBJECTS
				let i=0;
				if (!val)	return;																// Quit if nothing there
				if (o.kmapid_subjects_idfacet) {												// No facet data
					for (i=0;i<o.kmapid_subjects_idfacet.length;++i)							// For each one
						if (o.kmapid_subjects_idfacet[i].split("|")[0] == val)					// Find a match
							break;																// Quit
					i=Math.min(o.kmapid_subjects_idfacet.length-1,i);							// Cap
					}
				str3+=`<td>${title}: <i>${val}</i>`;											// Add title
				if (o.kmapid_subjects_idfacet)													// If data
					str3+=sui.pages.AddPop(o.kmapid_subjects_idfacet[i].split("|")[1])+"</td>";	// Add popover
				else
					str3+=sui.pages.AddPop(o.related_uid_ss[i])+"</td>";						// Add popover
				}	
		});
	}

	DrawTabMenu(num, tabs)																	// DRAW TAB MENU
	{
		let i,str="";														
		for (i=0;i<tabs.length;++i)	{															// For each tab	
			str+=`<div class='sui-tabTab' id='sui-tabTab-${num}-${i}' style='display:inline-block;text-align:left;padding-left:24px;width:calc(33.333% - 26px)'>
			${tabs[i]}&nbsp;&#xe609</div>`;														// Add it
			}
		str+=`<div class='sui-tabContent' id='sui-tabContent-${num}'>hhh</div>`;				// Tab contents
		return str.replace(/\t|\n|\r|/g,"");													// Return tab markup
	}

	ShowTab(num, which) 																	// SHOW TAB
	{
		$("[id^=sui-tabTab-"+num).css({"background-color":"#999",color:"#fff","border-top":"1px solid #999"});	// Reset all tabs
		$("#sui-tabContent-"+num).css({display:"block","background-color":"#eee"});				// Show content
		$("#sui-tabTab-"+num+"-"+which).css({"background-color":"#eee",color:"#000","border-top":"1px solid #a2733f"});	// Active tab
		$("#sui-tabContent-"+num).html(this.tabs[num][which]);									// Set content

		$("[id^=sui-tabTab]").off();															// Kill old handlers
		$("[id^=sui-termAssetBut-]").off();														
	
		$("[id^=sui-termAssetBut-]").on("click", (e)=> {										// ON TAGGED BUTTON CLICK
			let i,v=e.currentTarget.id.substring(17).split("-");								// Get def and facet type
			sui.ss.mode="related";																// Go to related mode
			sui.pages.relatedType=v[1];															// Set asset type
			sui.pages.relatedBase=this.kmap;													// Set base									
			sui.pagesrelatedId=sui.pages.relatedBase.asset_type+"-"+sui.pages.relatedBase.id;	// Set id
			
			if (v[1] == "all")	sui.curResults=this.tagged[v[0]];								// Show all
			else {																				// Just one
				sui.curResults=[];																// Clear
				for (i=0;i<this.tagged[v[0]].length;++i)										// For each asset
					if (this.tagged[v[0]][i].asset_type == v[1])								// If it matches
						sui.curResults.push(this.tagged[v[0]][i]);								// Add it
				}
			sui.DrawResults();																	// Draw results
			});

		$("[id^=sui-tabTab]").on("click", (e)=> {												// ON TAB CLICK
			var id=e.currentTarget.id.substring(11);											// Get index of tab	
			let v=id.split("-");																// Get num and which
			this.ShowTab(v[0],v[1]);															// Draw it
			});
	}


} // CLASS CLOSURE
