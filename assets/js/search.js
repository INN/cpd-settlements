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
      // The collection of all cases
      this.caseCollection = new Cases(cases_json);

      // The list of cases/search results view
      this.caseList = new CaseList({
        el: '#case-list-view'
      });

      // The collections of all officers
      this.officerCollection = new Officers(officers_json);

      // Officer list view
      this.officerList = new OfficerList({
        el: '#officer-list-view'
      });

      // The search tab selector view
      this.searchSelector = new SearchSelector({
        el: '#tabs',

        cases: this.caseCollection,
        caseList: this.caseList,

        officers: this.officerCollection,
        officerList: this.officerList
      });

      Backbone.Router.prototype.initialize.apply(this, arguments);
      return this;
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
    model: Case,

    comparator: function(x, y) {
     return this.newtoold(x,y);
    },

    hightolow: function(x, y) {
      var x_total = Number(x.get('total_payments')),
          y_total = Number(y.get('total_payments'))
      if (x_total < y_total)
        return 1;
      if (x_total > y_total)
        return -1;
      return 0;
    },

    lowtohigh: function(x, y) {
      var x_total = Number(x.get('total_payments')),
          y_total = Number(y.get('total_payments'))
      if (x_total < y_total)
        return -1;
      if (x_total > y_total)
        return 1;
      return 0;
    },

    newtoold: function(x, y) {
      var x_date = Date.parse(x.get('date_of_incident')),
          y_date = Date.parse(y.get('date_of_incident'))
      if (x_date < y_date)
        return 1;
      if (x_date > y_date)
        return -1;
      return 0;
    },

    oldtonew: function(x, y) {
      var x_date = Date.parse(x.get('date_of_incident')),
          y_date = Date.parse(y.get('date_of_incident'))
      if (x_date < y_date)
        return -1;
      if (x_date > y_date)
        return 1;
      return 0;
    },

    getUniqueValuesForAttr: function(attribute) {
      return _.compact(_.uniq(this.map(function(x) { return x.get(attribute); })));
    }
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

    initialize: function() {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.template = _.template($('#case-tmpl').html());
      this.cases.on('reset', this.render.bind(this));
      this.listSorter = new CaseListSort({
        caseList: this,
        el: '#case-list-sort',
      });
      return this;
    },

    render: function() {
      var self = this,
          content = '';

      this.$el.html('');
      this.cases.each(function(model) {
        content += self.template({ model: model.toJSON() });
      });
      this.$el.html(content);
      return this;
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

      formatted += '...<span class="read-more">Read More &raquo; </span>';

      return formatted;
    }
  });

  // OfficerList view
  var OfficerList = Backbone.View.extend({
    officers: new Officers(),

    initialize: function() {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.template = _.template($('#officer-tmpl').html());
      this.officers.on('reset', this.render.bind(this));
      return this;
    },

    render: function() {
      var self = this,
          content = '';

      this.$el.html('');
      this.officers.each(function(model) {
        content += self.template({ model: model.toJSON() });
      });
      this.$el.html(content);
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
        if (value.length > 2){
          $('.officer').each(function(){
            self.filterOfficers(this, value);       
          });
          if (detail) {
            $('body').removeClass('detail-page');
            $('body').removeClass('detail-case');
            $('body').removeClass('detail-officer');
          }
        } else {
          if (officerPage) {
            $('body').addClass('detail-page');
            $('body').addClass('detail-officer');
            $('.officer').show();
          } else if (casePage) {
            $('body').addClass('detail-page');
            $('body').addClass('detail-case');
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
    },

    filterCases: function(event, selection) {
      var case_numbers = selection.case_numbers,
          filteredCases = this.cases.filter(function(model) {
            if (case_numbers.indexOf(model.get('case_number')) >= 0) {
              return model;
            }
          });

      this.caseList.cases.reset(filteredCases);
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

      var context = _.extend(this.filterData, {
        incidents: this.caseList.cases.length,
        payments: this.caseList.cases.reduce( function(memo, model) {
          return memo + model.get('total_payments');
        }, 0),
      });

      // how to handle empties
      var content = this.template(context);
      this.$el.html(content.trim());
      $('#search-intro').hide();
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
      this.caseList = options.caseList

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

      var clearButton = $('.clear-filters')
      if (this.filterData.neighborhood == '' && this.filterData.primary_causes[0] == '' && this.filterData.total_payments == '' && $('#case-search-form input[type=checkbox]:checked').length < 1) {
        clearButton.hide();
      } else {
        clearButton.show();
      }

      clearButton.click(function(){
        $('#case-search-form input[type=checkbox]:checked').attr('checked', false).change();
        $('#case-search-form select').chosen().prop('selectedIndex',0).change().trigger("chosen:updated");
        $('.typeahead').val('').trigger('keyup');
        clearButton.unbind('click');
      });
      
    },

    filterCases: function() {
      var self = this,
          filteredCases = [];

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

          // if (['victim_1_race'].indexOf(name) >= 0) {
          //   if (name =='victim_1_race' && typeof model.get('victims') !== 'undefined') {
          //     var victims = model.get('victims');
          //     if (victims.length && victims[0].victim_1_race !== value) {
          //       ret = false;
          //     }
          //   }
          // }

          if (name == 'total_payments') {
            var paymentRange = value.split('-'),
                low = Number(paymentRange[0]),
                high = Number(paymentRange[1]),
                //caseTotalPayments = Number(model.get(name));
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
          filteredCases.push(model);
        }
      });

      this.caseList.cases.reset(filteredCases);
    },

    initChosen: function() {
      this.$el.find('select.chosen').chosen();
    },

    initTags: function() {
      $('#tag-toggle').click(function(){
        $(this).toggleClass('expanded');
        $('#tag-group').slideToggle();
      })
    }

  });

  var CaseListSort = Backbone.View.extend({
    initialize: function(options) {
      this.$el.chosen({ width: '200px', disable_search : true});
      this.caseList = options.caseList;
      this.caseList.cases.on(
        'sort', this.caseList.render.bind(
          this.caseList
        )
      );
      Backbone.View.prototype.initialize.apply(this, arguments);
      return this;
    },

    events: {
      'change': 'sortCaseList'
    },

    sortCaseList: function(event) {
      var option = $(event.currentTarget).val();
      switch (option) {
        case 'payment-low-high':
          this.caseList.cases.comparator = this.caseList.cases.lowtohigh;
          break;
        case 'payment-high-low':
          this.caseList.cases.comparator = this.caseList.cases.hightolow;
          break;
        case 'date-newest-oldest':
          this.caseList.cases.comparator = this.caseList.cases.newtoold;
          break;
        case 'date-oldest-newest':
          this.caseList.cases.comparator = this.caseList.cases.oldtonew;
          break;
        default:
          this.caseList.cases.comparator = this.caseList.cases.newtoold;
          break;
      }
      this.caseList.cases.sort();
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
          })
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
  });

  $(window).resize(function(){
    var width = $(this).width();
    if (width >= 820){
      $('#tag-toggle').removeClass('expanded');
      $('#tag-group').attr('style', '');
    }
  })

})();
