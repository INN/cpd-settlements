function loadText(){
	// ID of the Google Spreadsheet
	var spreadsheetID = "1z59WxmAKbePMXrAOQ3-bbcYlJfQUC95V1sRKM_m1WT0";
	
	// Make sure it is public or set to Anyone with link can view 
	var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";

	$.getJSON(url, function(data) {

		var entry = data.feed.entry;

		$(entry).each(function(index){
			// Column names
			var col1 = this.gsx$slidetext.$t;
			var col2 = this.gsx$twitterurl.$t;
			var col3 = this.gsx$facebookurl.$t;
			var col4 = this.gsx$shortlink.$t;
			var slide_num = index+1;
			var html = '<div class="block"><h3>' + col1;
			var links = '<span class="social-icons">';
			var a1  = '<a target="_blank" href="' + col2 + '" onclick="window.open(';
				a1 += "'" + col2;
				a1 += "', 'newwindow', 'width=600, height=400'); return false;";
				a1 += '"><span class="share icon-twitter"></span></a>';
			var a2  = '<a target="_blank" href="' + col3 + '" onclick="window.open(';
				a2 += "'" + col3;
				a2 += "', 'newwindow', 'width=600, height=400'); return false;";
				a2 += '"><span class="share icon-facebook"></span></a>';
			var a3  = '<a target="_blank" href="mailto:?subject=A Chicago Reporter Investigation&amp;body=' + col4 + '"><span class="share icon-mail"></span></a>';

			if (col2){
				links += a1;
			}
			if (col3){
				links += a2;
			}
			if (col4){
				links += a3;
			}
				html += links;
				html += '</span></h3></div>';

			$('#slide-' + slide_num).append(html);
			//$('#cpd-scrolling').append(html);

			if (entry.length == slide_num){
				initScroll();
			}
		});

	});	
}

// detect if mobile browser. regex -> http://detectmobilebrowsers.com
var isMobile = (function(a){return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);


function stringDuration(duration){
	if (isMobile){
		duration = duration/2;
	}
	var string_duration = duration.toString() + '%';
	return string_duration;
}

function initScroll(){
	// init controller
	var controller = new ScrollMagic.Controller();
	var main_offset = $(window).height()/2;


	// introtext
	var dur_introtext = stringDuration(40);
	var tween_introtext = TweenMax.to("#desc", 1, {opacity: 0});
	var scene_introtext = new ScrollMagic.Scene({triggerElement: "#trigger-intro", duration: dur_introtext, offset: main_offset})
					.setTween(tween_introtext)
					.setPin("#desc")
					.addTo(controller);

	// introtext
	var dur_toomuch = stringDuration(40);
	var tween_toomuch = TweenMax.to("#desc h1", 1, {color: '#bd261d'});
	var scene_toomuch = new ScrollMagic.Scene({triggerElement: "#trigger-intro", duration: dur_toomuch, offset: main_offset})
					.setTween(tween_toomuch)
					.addTo(controller);

	// introimg
	var dur_introimg = stringDuration(300);
	var scene_introimg = new ScrollMagic.Scene({triggerElement: "#trigger-intro", duration: dur_introimg, offset: main_offset})
					.setPin("#slide-intro .img.fixed")
					.addTo(controller);

	// slide 1
	var dur_slide1 = stringDuration(200);
	var scene_slide1 = new ScrollMagic.Scene({triggerElement: "#trigger-1", duration: dur_slide1, offset: main_offset})
					.addTo(controller)
					.setPin("#slide-1 .block h3")
					.on('enter', function(e){
						//TweenMax.fromTo(['#slide-1', '#slide-1'], 1, {opacity:0}, {opacity:1});
						TweenMax.to('#slide-1', 1, {opacity:1});
					})
					.on('leave', function(e){
						//TweenMax.fromTo(['#slide-1', '#slide-1'], 1, {opacity:1}, {opacity:0});
						TweenMax.to('#slide-1', 1, {opacity:0});
					})

	// slide 2
	var dur_slide2 = stringDuration(515);
	var scene_slide2 = new ScrollMagic.Scene({triggerElement: "#trigger-2", duration: dur_slide2, offset: 200})
					.addTo(controller)
					.setPin("#slide-2 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-2', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-2', 2, {opacity:0});
					});

	// slide 2 background images
	var dur_bg1 = stringDuration(100);
	var bg1 = new ScrollMagic.Scene({triggerElement: "#trigger-bg1", duration: dur_bg1, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-1', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-1', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	var dur_bg2 = stringDuration(200);
	var bg2 = new ScrollMagic.Scene({triggerElement: "#trigger-bg2", duration: dur_bg2, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-2', 2, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-2', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	var dur_bg3 = stringDuration(300);
	var bg3 = new ScrollMagic.Scene({triggerElement: "#trigger-bg3", duration: dur_bg3, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-3', 3, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-3', 1, {opacity:0});
					})
					.addTo(controller);

	// slide 3
	var dur_slide3 = stringDuration(100);
	var scene_slide3 = new ScrollMagic.Scene({triggerElement: "#trigger-3", duration: dur_slide3, offset: 200})
					.addTo(controller)
					.setPin("#slide-3 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-3', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-3', 2, {opacity:0});
					});


	// slide 2 background images
	var dur_bg4 = stringDuration(700);
	var bg4 = new ScrollMagic.Scene({triggerElement: "#trigger-bg4", duration: dur_bg4, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-4', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-4', 1, {opacity:0});
						TweenMax.to('#slide-5', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	// var bg5 = new ScrollMagic.Scene({triggerElement: "#trigger-bg5", duration: '800%', offset: main_offset})
	// 				.on('enter', function(e){
	// 					TweenMax.to('#bg-5', 1, {opacity:1});
	// 				})
	// 				.on('leave', function(e){
	// 					TweenMax.to('#bg-5', 1, {opacity:0});
	// 				})
	// 				.addTo(controller);


	// slide 4
	var dur_slide4 = stringDuration(220);
	var scene_slide4 = new ScrollMagic.Scene({triggerElement: "#trigger-4", duration: dur_slide4, offset: 200})
					.addTo(controller)
					.setPin("#slide-4 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-4', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-4', 1, {opacity:0});
					});

	// slide 5
	var dur_slide5 = stringDuration(220);
	var scene_slide5 = new ScrollMagic.Scene({triggerElement: "#trigger-5", duration: dur_slide5, offset: 200})
					.addTo(controller)
					.setPin("#slide-5 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-5', 1, {opacity:1});
					})
					.on('leave', function(e){
						// bg-4
					});
	// slide 6
	var dur_slide6 = stringDuration(300);
	var scene_slide6 = new ScrollMagic.Scene({triggerElement: "#trigger-6", duration: dur_slide6, offset: 200})
					.addTo(controller)
					.setPin("#slide-6 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-6', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-6', 1, {opacity:0});
					});


	// slide 2 background images
	var dur_bg6 = stringDuration(200);
	var bg6 = new ScrollMagic.Scene({triggerElement: "#trigger-bg6", duration: dur_bg6, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-6', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-6', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	var dur_bg7 = stringDuration(200);
	var bg7 = new ScrollMagic.Scene({triggerElement: "#trigger-bg7", duration: dur_bg7, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-7', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-7', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	var dur_bg8 = stringDuration(200);
	var bg8 = new ScrollMagic.Scene({triggerElement: "#trigger-bg8", duration: dur_bg8, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-8', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-8', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	var dur_bg9 = stringDuration(200);
	var bg9 = new ScrollMagic.Scene({triggerElement: "#trigger-bg9", duration: dur_bg9, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-9', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-9', 1, {opacity:0});
					})
					.addTo(controller);
	// slide 2 background images
	var dur_bg10 = stringDuration(200);
	var bg10 = new ScrollMagic.Scene({triggerElement: "#trigger-bg10", duration: dur_bg10, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-10', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-10', 1, {opacity:0});
					})
					.addTo(controller);

	// slide 7
	var dur_slide7 = stringDuration(300);
	var scene_slide7 = new ScrollMagic.Scene({triggerElement: "#trigger-7", duration: dur_slide7, offset: 200})
					.addTo(controller)
					.setPin("#slide-7 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-7', 1, {opacity:1});
						TweenMax.to('#bg-11-overlay', 0, {opacity:0});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-7', 1, {opacity:0});
					});

	// slide 2 background images
	var dur_bg11 = stringDuration(1250);
	var bg11 = new ScrollMagic.Scene({triggerElement: "#trigger-bg11", duration: dur_bg11, offset: main_offset})
					.on('enter', function(e){
						TweenMax.to('#bg-11', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#bg-11', 1, {opacity:0});
					})
					.addTo(controller);

	// slide 8
	var dur_slide8 = stringDuration(200);
	var scene_slide8 = new ScrollMagic.Scene({triggerElement: "#trigger-8", duration: dur_slide8, offset: 250})
					.addTo(controller)
					.setPin("#slide-8 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-8', 1, {opacity:1});
						TweenMax.to('#bg-11-overlay', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-8', 1, {opacity:0});
						var direction = e.target.controller().info("scrollDirection").toLowerCase();
						if (direction !=='forward'){
							TweenMax.to('#bg-11', 1, {opacity:0});
						}
					});

	// slide 9
	var dur_slide9 = stringDuration(200);
	var scene_slide9 = new ScrollMagic.Scene({triggerElement: "#trigger-9", duration: dur_slide9, offset: 300})
					.addTo(controller)
					.setPin("#slide-9 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-9', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-9', 1, {opacity:0});
					});

	// slide 10
	var dur_slide10 = stringDuration(200);
	var scene_slide10 = new ScrollMagic.Scene({triggerElement: "#trigger-10", duration: dur_slide10, offset: 350})
					.addTo(controller)
					.setPin("#slide-10 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-10', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-10', 1, {opacity:0});
					});

	// slide 11
	var dur_slide11 = stringDuration(200);
	var scene_slide11 = new ScrollMagic.Scene({triggerElement: "#trigger-11", duration: dur_slide11, offset: 350})
					.addTo(controller)
					.setPin("#slide-11 .block h3")
					.on('enter', function(e){
						TweenMax.to('#slide-11', 1, {opacity:1});
					})
					.on('leave', function(e){
						TweenMax.to('#slide-11', 1, {opacity:0});
					});

	// init tween, then scene
	var duration_bar = $('#cpd-scrolling').height() - main_offset;
	var tween_bar = TweenMax.to("#cpd-progress rect", 1, {width: '100%'});
	var scene_bar = new ScrollMagic.Scene({triggerElement: "#trigger-top", duration: duration_bar, offset: main_offset})
					.setTween(tween_bar)
					.addTo(controller);

	// // add indicators (requires plugin)
	// scene_bar.addIndicators();	
	// scene_introimg.addIndicators();	
	// scene_introtext.addIndicators();	
	// scene_slide2.addIndicators();		
	// bg1.addIndicators();		
	// bg2.addIndicators();		
	// bg3.addIndicators();		
	// scene_slide3.addIndicators();		
	// scene_slide3img.addIndicators();		
	// scene_slide5.addIndicators();		
	// scene_slide6.addIndicators();	
}