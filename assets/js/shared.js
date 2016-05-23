
function case_twitter(element){
  var $case = $(element).closest('.case, .case-detail');
  var dollars = $case.find('h2').text();
  var cause = $case.find('h3').text().toLowerCase();
  var link; 
  if ($case.find('a.case-link').get(0)) {
    link = $case.find('a.case-link').get(0).href;  
  } else {
    link = window.location.href;
  }  
  var text = "This police lawsuit for " + cause + " cost Chicago " + dollars + ". " + link + " via @chicagoreporter";
  var twitter_url = "https://twitter.com/home?status=" + encodeURIComponent(text);
  window.open(twitter_url, 'newwindow', 'width=600, height=400');
}
function case_facebook(element){
  var $case = $(element).closest('.case, .case-detail');
  var dollars = $case.find('h2').text();
  var link;
  if ($case.find('a.case-link').get(0)) {
    link = $case.find('a.case-link').get(0).href;
  } else {
    link = window.location.href;
  }
  var facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + link; 
  window.open(facebook_url, 'newwindow', 'width=600, height=400');
}
function officer_twitter(element){
  var $officer = $(element).closest('.officer');
  var name = $officer.find('h2').text();
  var link;
  if ($officer.find('a.officer-link').get(0)){
    link = $officer.find('a.officer-link').get(0).href;
  } else {
    link = window.location.href;
  }
  var dollars = $officer.find('.total-payments').text();

  var text;
  if ($('.detail-officer').length > 0){
    text = $.trim($('.officer-expanded .total-payments-container').text()).replace(/\n/g,' ') + ' ' + link + ' via @chicagoreporter';
  } else {
    text = name + " was named in police misconduct lawsuits that cost Chicago " + dollars + ". " + link + ' via @chicagoreporter';
  }
  
  var twitter_url = "https://twitter.com/home?status=" + encodeURIComponent(text);
  window.open(twitter_url, 'newwindow', 'width=600, height=400');
}
function officer_facebook(element){
  var $officer = $(element).closest('.officer');
  var link;
  if ($officer.find('a.officer-link').get(0)){
    link = $officer.find('a.officer-link').get(0).href;
  } else {
    link = window.location.href;
  }
  var facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + link; 
  window.open(facebook_url, 'newwindow', 'width=600, height=400');
}

function split_tags(tags){
  var tags = tags.split("|");
  var tag_html = "";
  for (var i=0; i< tags.length; i++){
    var tag = tags[i];
    if (tag !== 'LGBT') {
      tag_html += "<span class='display-tag'>" + tag.toLowerCase() + "</span>";
    } else {
      tag_html += "<span class='display-tag'>" + tag + "</span>";
    }    
  }
  return tag_html;
}

function sort_cases(json){
  var array=[],obj=json;
  for(a in obj){
   array.push(obj[a])
  }
  //sort by date (most recent to oldest)
  array.sort(function(x,y){
    var x_date = Date.parse(x.date_of_incident),
        y_date = Date.parse(y.date_of_incident)
    if (x_date < y_date)
      return 1;
    if (x_date > y_date)
      return -1;
    return 0;
  });

  return array;
}

$(document).ready(function(){
  $('.menu-toggle-wrap').click(function(){
    var parent = $(this).closest('#main-menu')
    parent.toggleClass('expanded');
  });
});