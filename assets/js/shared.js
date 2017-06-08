Number.prototype.formatMoney = function(c, d, t){
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
      (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function languagize(int) {
  if (int < 10){
        if (int == 0) { int = 'no'};
        if (int == 1) { int = 'one'};
        if (int == 2) { int = 'two'};
        if (int == 3) { int = 'three'};
        if (int == 4) { int = 'four'};
        if (int == 5) { int = 'five'};
        if (int == 6) { int = 'six'};
        if (int == 7) { int = 'seven'};
        if (int == 8) { int = 'eight'};
        if (int == 9) { int = 'nine'};
      }
      return int;
}

function findOfficer(slug) {
  for (i = 0; i < officers_json.length; i++) {
      var officerObj = officers_json[i];
      if (officerObj.slug == slug) {
          return officerObj;
          break;
      }
  }
}

function getOfficerData(code, array) {
  return array.filter(
    function(array){return array.slug == code}
  );
}

function getCases(officer) {
  var officerCases = [];

  for (var i=0; i<cases_json.length; i++) {
    var filteredCases = cases_json[i];
    var officers = filteredCases.officers;

    var foundOfficer = getOfficerData(officer, officers);

    if (foundOfficer.length > 0) {
      officerCases.push(filteredCases);
    }
  }

  return officerCases;
}

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
  var slug = $officer.data('slug');
  var officerObj = findOfficer(slug);

  var link;
  if ($officer.find('a.officer-link').get(0)){
    link = $officer.find('a.officer-link').get(0).href;
  } else {
    link = window.location.href;
  }

  if (officerObj) {
    var text = '';
    var name = officerObj.first + ' ' + officerObj.last;
    var dollars = officerObj.total_payments.formatMoney(0);
    var numCases = getCases(slug).length;

    if (numCases == 1) {
      text = toTitleCase(name) + " was named in one police misconduct lawsuit that cost Chicago $" + dollars + ". " + link + ' via @chicagoreporter';
    } else {
      text = toTitleCase(name) + " was named in " + languagize(numCases) + " police misconduct lawsuits that cost Chicago $" + dollars + ". " + link + ' via @chicagoreporter';
    }
    
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
    if ( (tag == 'LGBT') || (tag == 'Muslim') ) {
      tag_html += "<span class='display-tag'>" + tag + "</span>";
    } else {
      tag_html += "<span class='display-tag'>" + tag.toLowerCase() + "</span>";
    }    
  }
  return tag_html;
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function adjust_whitespace(){
  var click_tags = $('.clickable.tag');
  for (var i=0; i<click_tags.length; i++){
    var this_tag = $(click_tags[i]);
    var tag_text = this_tag.html();
    //tag_text.replace(' <span class="x">', '<span class="x">'); 
    //tag_text.replace(/(\r\n|\n|\r)/gm,'').replace(/\s+/g,'').replace(/\d/g, '');
    //tag_text = $.trim(tag_text).replace(/(\r\n|\n|\r)/gm,'');
    tag_text = tag_text.replace(/(\r\n|\n|\r)/gm,'').replace(/ +(?= )/g,'');
    tag_text = tag_text.replace(' .','.');
    tag_text = tag_text.replace(' ,',',');
    tag_text = tag_text.replace(' <sp','<sp');
    this_tag.html(tag_text);
  }
  
}

function set_cookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = '; expires='+date.toGMTString();
  }
  else var expires = '';
  document.cookie = name+'='+value+expires+'; path=/';
}

function get_cookie(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function erase_cookie(name) {
  set_cookie(name,'',-1);
}

$(document).ready(function(){
  $('.menu-toggle-wrap').click(function(){
    var parent = $(this).closest('#main-menu')
    parent.toggleClass('expanded');
  });

  $('.mobile-tab-selector li.cases').click(function(){
    if ( !($('body').hasClass('filter-cases')) ) {
      $('.tab-selector .cases a').trigger('click');
    }
  });

  $('.mobile-tab-selector li.officers').click(function(){
    if ( !($('body').hasClass('filter-officers')) ) {
      $('.tab-selector .officers a').trigger('click');
    }
  });

  $('#explore-data').click(function(){
    var $search = $('.search');
    var $toggle = $(this).find('span');
    $search.toggleClass('expanded')
  });

  $('#replay-intro').click(function(){
    window.location.href = site_path;
  });

  $('label.option').hover(function(){
    var inner = $(this).find('span');
    var outer = $(this);

    inner.css('display', 'inline');
    
    var diff = outer.width() - inner.width();

    if (diff < -4){
      inner.css({
        'left': diff,
        'width': inner.width + diff
      })
    }
  }, function(){
    $(this).find('span').css({
      'left':'',
      'display': 'block'
    })
  });

});


$(window).resize(function(){
  var width = $(this).width();
  if (width >= 820){
    $('#tag-toggle').removeClass('expanded');
    $('#tag-group').attr('style', '');
    $('#main-menu').removeClass('expanded');
  }
});





