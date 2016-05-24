
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





