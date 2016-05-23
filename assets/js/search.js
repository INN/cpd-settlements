(function() {
  var $ = jQuery;

  // Router
  var SearchRouter = Backbone.Router.extend({
    routes: {
      'search': 'cases',
      'search/': 'cases',
      'search/index.html': 'cases',

      'search/officers': 'officers',
      'search/cases': 'cases',

      'search/officers/': 'officers',
      'search/officers/index.html': 'officers',

      'search/cases/': 'cases',
      'search/cases/index.html': 'cases',

      'case/*path': 'case_detail',
      'officer/*path': 'officer_detail'
    },

    initialize: function() {
      var self = this;

      // The collection of all cases
      this.caseCollection = new Cases();

      // The list of cases/search results view
      this.caseList = new CaseList({
        el: '#case-list-view',
        cases: this.caseCollection
      });

      // The collections of all officers
      this.officerCollection = new Officers();

      // Officer list view
      this.officerList = new OfficerList({
        el: '#officer-list-view',
        officers: this.officerCollection
      });

      // The search tab selector view
      this.searchSelector = new SearchSelector({
        el: '#tabs',

        cases: this.caseCollection,
        caseList: this.caseList,

        officers: this.officerCollection,
        officerList: this.officerList
      });

      this.loadData(function() {

        cases_json = sort_cases(cases_json);



        self.officerCollection = self.officerCollection.reset(officers_json);
        self.caseCollection = self.caseCollection.reset(cases_json);
      });

      Backbone.Router.prototype.initialize.apply(this, arguments);
      return this;
    },

    loadData: function(callback) {
      if (typeof cases_json == 'undefined' && typeof officers_json == 'undefined') {
        var url = site_path + 'assets/cpd_settlements/data/combined.min.js';
        $.ajax({
          url: url,
          cache: true,
          dataType: 'script',
          success: callback
        });
      }
    },

    officers: function() {
      this.searchSelector.goToTab('officers');
      return false;
    },

    officer_detail: function() {
      this.searchSelector.goToTab('officers', true);
      return false;
    },

    cases: function() {
      this.searchSelector.goToTab('cases');
      return false;
    },

    case_detail: function() {
      this.searchSelector.goToTab('cases', true);
      return false;
    }

  });

  // Case model
  var Case = Backbone.Model.extend({});

  // Cases collection
  var Cases = Backbone.Collection.extend({
    model: Case
  });

  // Officer model
  var Officer = Backbone.Model.extend({});

  // Officers collection
  var Officers = Backbone.Collection.extend({
    model: Officer,
    comparator: 'last'
  });

  // Neighborhood
  var Neighborhood = Backbone.Model.extend({});

  // Collection of Neighborhoods
  var Neighborhoods = Backbone.Collection.extend({
    model: Neighborhood,

    comparator: 'neighborhood'
  });

  // Officer model
  var Officer = Backbone.Model.extend({});

  // Officer collection
  var Officers = Backbone.Collection.extend({
    model: Officer
  });

  // CaseList view
  var CaseList = Backbone.View.extend({

    cases: new Cases(),

    case_numbers: [],

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.template = _.template($('#case-tmpl').html());
      this.cases = options.cases;
      this.cases.on('reset', this.render.bind(this));
      this.listSorter = new CaseListSort({
        caseList: this,
        el: '#case-list-sort',
      });
      this.render();
      return this;
    },

    render: function() {
      var self = this,
          content = '';

      if (!this.cases.length) {
        this.$el.html('<div class="loading">Loading...</div>');
      } else {
        this.$el.html('');
        this.cases.each(function(model) {
          content += self.template({ model: model.toJSON() });
        });
        this.$el.html(content);
      }
      return this;
    },

    sortElements: function(option) {
      var comparator;

      switch (option) {
        case 'payment-low-high':
          comparator = this.lowtohigh;
        break;
        case 'payment-high-low':
          comparator = this.hightolow;
        break;
        case 'date-newest-oldest':
          comparator = this.newtoold;
        break;
        case 'date-oldest-newest':
          comparator = this.oldtonew;
        break;
        default:
          comparator = this.newtoold;
        break;
      }

      var case_elements = this.$el.children('.case');
      case_elements.sort(comparator);
      case_elements.detach().appendTo(this.$el);
    },

    renderFiltered: function(case_numbers) {
      if (!case_numbers) {
        case_numbers = this.case_numbers;
      } else {
        this.case_numbers = case_numbers;
      }

      var self = this;

      this.$el.find('.case').hide();
      _.each(case_numbers, function(case_number) {
        self.$el.find('[data-case_number="' + case_number + '"]').show();
      });

      return this;
    },

    hightolow: function(x, y) {
      var x_total = Number($(x).data('total_payments')),
          y_total = Number($(y).data('total_payments'))
      if (x_total < y_total)
        return 1;
      if (x_total > y_total)
        return -1;
      return 0;
    },

    lowtohigh: function(x, y) {
      var x_total = Number($(x).data('total_payments')),
          y_total = Number($(y).data('total_payments'))
      if (x_total < y_total)
        return -1;
      if (x_total > y_total)
        return 1;
      return 0;
    },

    newtoold: function(x, y) {
      var x_date = Date.parse($(x).data('date_of_incident')),
          y_date = Date.parse($(y).data('date_of_incident'))
      if (x_date < y_date)
        return 1;
      if (x_date > y_date)
        return -1;
      return 0;
    },

    oldtonew: function(x, y) {
      var x_date = Date.parse($(x).data('date_of_incident')),
          y_date = Date.parse($(y).data('date_of_incident'))
      if (x_date < y_date)
        return -1;
      if (x_date > y_date)
        return 1;
      return 0;
    },

    formatStr: function(text) {
      var formatted = '';

      // https://regexper.com/#%5E(%5Cr%5Cn%7C.)%7B1%2C280%7D%5Cb
      formatted = text.match(/^(\r\n|.){1,280}\b/g).join('');

      //if (formatted.substring(formatted.length-1) == '-' || ' ' || ',' || ';'){
      if (formatted.substring(formatted.length-1) == ' '){
        formatted = formatted.substring(0, formatted.length-1);
      }
      if (formatted.substring(formatted.length-1) == ','){
        formatted = formatted.substring(0, formatted.length-1);
      }
      if (formatted.substring(formatted.length-1) == '-'){
        formatted = formatted.substring(0, formatted.length-1);
      }

      formatted += '...<span class="read-more">Read More&nbsp;&raquo; </span>';

      return formatted;
    }
  });

  // OfficerList view
  var OfficerList = Backbone.View.extend({
    officers: new Officers(),

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.officers = options.officers;
      this.officers.on('reset', this.render.bind(this));
      this.template = _.template($('#officer-tmpl').html());
      this.render();
      return this;
    },

    render: function() {
      var self = this,
          content = '';

      this.$el.html('');
      if (!this.officers.length) {
        this.$el.html('<div class="loading">LOADING...</div>');
      } else {
        this.officers.each(function(model) {
          content += self.template({ model: model.toJSON() });
        });
        this.$el.html(content);
      }
      return this;
    }
  });

  // OfficerSearchForm view
  var OfficerSearchForm = Backbone.View.extend({

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.officerList = options.officerList;
      this.officers = options.officers;
      this.initTypeahead();
      return this;
    },

    initTypeahead: function() {
      var self = this;

      $('.typeahead').keyup(function(){
        var detail = $('.detail-page');
        var officerPage = $('detail-officer');
        var casePage = $('detail-case');
        var value = $(this).val().toLowerCase();

        // only filter officers if there are more than two letters in the textbox
        if (value.length > 0){
          $('.officer').each(function(){
            self.filterOfficers(this, value);
          });
          if (detail) {
            $('body').removeClass('detail-page');
            $('body').removeClass('detail-case');
            $('body').removeClass('detail-officer');
          }
        } else {
          if (officerPage.length > 0) {
            $('body').addClass('detail-page');
            $('body').addClass('detail-officer');
            $('.officer').show();
          } else if (casePage > 0) {
            $('body').addClass('detail-page');
            $('body').addClass('detail-case');
          } else {
            $('.results-wrapper-inner .officer').show();
          }
        }
      });
    },

    filterOfficers: function(selection, value) {
      var $this = $(selection);
      var $officer = $this.find('h2');
      var $badge = $this.find('.badge-num');
      var $slug = $this.find('.slug');
      var searchText = ( $officer.text() + $badge.text() + $slug.text() ).toLowerCase();

      (searchText.indexOf(value) >= 0) ? $this.show() : $this.hide();
    }

  });

  var CaseSearchStatement = Backbone.View.extend({

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.filterData = options.filterData;
      this.template = _.template($('#case-search-statement-tmpl').html());
      this.caseList = options.caseList;
      return this;
    },

    render: function() {
      if ( typeof this.filterData == 'undefined' ) {
        return false;
      }

      var self = this,
          context = _.extend(this.filterData, {
            incidents: this.languagize(this.caseList.case_numbers.length),
            payments: _.reduce( this.caseList.cases.filter(function(c) {
                if (_.indexOf(self.caseList.case_numbers, c.get('case_number')) >= 0) {
                  return c;
                }
              }),
              function(memo, model) {
                return memo + model.get('total_payments');
              }, 0)
          });

      // how to handle empties
      var content = this.template(context);
      this.$el.html(content.trim());
      $('#search-intro').hide();
    },

    languagize: function(int) {
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
  });

  // CaseSearchForm view
  var CaseSearchForm = Backbone.View.extend({

    events: {
      'change :input': 'handleChange'
    },

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.filterData = this.$el.serializeObject();
      this.cases = options.cases;
      this.caseList = options.caseList;

      this.initChosen();
      this.initTags();

      return this;
    },

    handleChange: function() {
      this.filterData = this.$el.serializeObject();
      this.filterCases();
      this.updateStatement();

      $('body').removeClass('detail-page');
      $('body').removeClass('detail-case');
      $('body').removeClass('detail-officer');
    },

    updateStatement: function() {
      if (typeof this.caseSearchStatement == "undefined") {
        this.caseSearchStatement = new CaseSearchStatement({
          filterdata: this.filterData,
          el : '#case-search-statement',
          caseList : this.caseList,
        });
      }
      this.caseSearchStatement.filterData = this.filterData;
      this.caseSearchStatement.render();

      var clearButton = $('.clear-filters');
      var filterStatement = $('.filter-statement').hide();
      var statementWrapper = $('.search-statement-wrapper');
      if (this.filterData.neighborhood == '' && this.filterData.primary_causes[0] == '' && this.filterData.total_payments == '' && $('#case-search-form input[type=checkbox]:checked').length < 1) {
        clearButton.hide();
        filterStatement.hide();
        statementWrapper.removeClass('filtered');
      } else {
        clearButton.show();
        filterStatement.show();
        statementWrapper.addClass('filtered');
      }
      $('.clickable .x').click(function(){
        var $this = $(this);
        var neighborhood = $(this).closest('.clickable.neighborhood').length;
        var payment_amount = $(this).closest('.clickable.payment_amount').length;
        var primary_cause = $(this).closest('.clickable.primary_cause').length;
        var tag = $(this).closest('.clickable.tag').length;

        if (neighborhood > 0) {
          $("#neighborhood").chosen().prop('selectedIndex',0).change().trigger("chosen:updated");
        } else if (payment_amount > 0) {
          $("#payment_amount").chosen().prop('selectedIndex',0).change().trigger("chosen:updated");
        } else if (primary_cause > 0) {
          $("#primary_cause").chosen().prop('selectedIndex',0).change().trigger("chosen:updated");
        } else if (tag > 0) {
          var tagVal = $(this).parent().data('val');
          $('#case-search-form input[type=checkbox]:checked').each(function(){
            var checkbox = $(this);
            var value = $(this).val().toLowerCase();
            if (tagVal == value) {
              checkbox.attr('checked', false).change();
            }
          });
        }
      });

      clearButton.click(function(){
        $('#case-search-form input[type=checkbox]:checked').attr('checked', false).change();
        $('#case-search-form select').chosen().prop('selectedIndex',0).change().trigger("chosen:updated");
        $('.typeahead').val('').trigger('keyup');
        clearButton.unbind('click');
      });

    },

    filterCases: function() {
      var self = this,
          case_numbers = [];

      this.cases.each(function(model) {
        var ret = true;

        _.each(self.filterData, function(value, name) {
          if (value == '')
            return;

          if (['neighborhood'].indexOf(name) >= 0) {
            if (name == 'neighborhood') {
              if (value == 'unknown') {
                if (typeof model.get(name) !== 'undefined') {
                  ret = false;
                }
              } else if (model.get(name) !== value) {
                ret = false;
              }
            }
          }

          if (name == 'total_payments') {
            var paymentRange = value.split('-'),
                low = Number(paymentRange[0]),
                high = Number(paymentRange[1]),
                caseTotalPayments = Number(model.get('total_payments'));

            if ( ! ( (caseTotalPayments >= low) && (caseTotalPayments <= high) ) ) {
              ret = false;
            }
          }

          if (name == 'primary_causes') {
            if (value.indexOf(model.get('primary_cause')) < 0) {
              ret = false;
            }
          }

          if (name == 'tags') {
            var tags = model.get('tags').toLowerCase();
            var hasAll = true;
            $('input:checked').each(function(){
              var value = $(this).attr('value');
              if (tags.indexOf(value) >= 0) {
                hasAll = true;
              } else {
                hasAll = false;
                return false;
              }
            })

            if (!hasAll) {
              ret = false;
            }
          }

        });

        if (ret) {
          case_numbers.push(model.get('case_number'));
        }
      });

      this.caseList.renderFiltered(case_numbers);

    },

    initChosen: function() {
      this.$el.find('select.chosen').chosen();
    },

    initTags: function() {
      $('#tag-toggle').click(function(){
        $(this).toggleClass('expanded');
        $('#tag-group').toggle();
      })
    }

  });

  var CaseListSort = Backbone.View.extend({
    initialize: function(options) {
      this.$el.chosen({ width: '200px', disable_search : true});
      this.caseList = options.caseList;
      this.caseList.cases.on(
        'sort', this.caseList.renderFiltered.bind(this.caseList)
      );
      Backbone.View.prototype.initialize.apply(this, arguments);
      return this;
    },

    events: {
      'change': 'sortCaseList'
    },

    sortCaseList: function(event) {
      var option = $(event.currentTarget).val();
      this.caseList.sortElements(option);
    },
  });

  var SearchSelector = Backbone.View.extend({
    events: {
      'click .tab-selector a': 'goToTab'
    },

    initialize: function(options) {
      this.cases = options.cases;
      this.caseList = options.caseList;
      this.officers = options.officers;
      this.officerList = options.officerList;
      Backbone.View.prototype.initialize.apply(this, arguments);
      return this;
    },

    goToTab: function(tabId, detail) {
      var fragment;

      if (typeof tabId == 'string') {
        fragment = 'search/' + tabId;
      } else {
        fragment = $(tabId.currentTarget).attr('href').replace(Backbone.history.root, '');
      }

      if (tabId == 'cases') {
        $('body').removeClass('filter-officers');
        $('body').addClass('filter-cases');
        if (typeof this.caseForm == 'undefined') {
          this.caseForm = new CaseSearchForm({
            el: '#case-search-form',
            cases: this.cases,
            caseList: this.caseList
          });
        }
        this.caseForm.filterCases();
      } else {
        $('body').removeClass('filter-cases');
        $('body').addClass('filter-officers');
        if (typeof this.officerForm == 'undefined') {
          this.officerForm = new OfficerSearchForm({
            el: '#officer-search-form',
            officers: this.officers,
            officerList: this.officerList
          });
        }
      }

      if (!detail){
        Backbone.history.navigate(fragment, { trigger: true });
        return false;
      }
    }

  });

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

  $(document).ready(function() {
    window.router = new SearchRouter();
    Backbone.history.start({
      pushState: true,
      root: site_path
    });


    $('#replay-intro').click(function(){
      // $('#cpd-scrolling').show();
      // $('.slide, .bgimg').css('opacity', '');
      // $('.cpd-container').css('opacity', 0);
      // initScroll();
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
    }
  });

})();


