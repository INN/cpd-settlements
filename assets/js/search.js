(function() {
  var $ = jQuery;

  // Router
  var SearchRouter = Backbone.Router.extend({
    routes: {
      '': 'cases',
      'officers': 'officers',
      'cases': 'cases'
    },

    initialize: function() {
      // The collection of all cases
      this.cases = new Cases(cases_json);

      // The list of cases/search results view
      this.caseList = new CaseList({
        el: '#case-list-view'
      });

      // The search tab selector view
      this.searchSelector = new SearchSelector({
        el: '#tabs',
        cases: this.cases,
        caseList: this.caseList
      });

      Backbone.Router.prototype.initialize.apply(this, arguments);
      return this;
    },

    officers: function() {
      this.searchSelector.goToTab('officers');
      return false;
    },

    cases: function() {
      this.searchSelector.goToTab('cases');
      return false;
    }
  });

  // Case model
  var Case = Backbone.Model.extend({});

  // Cases collection
  var Cases = Backbone.Collection.extend({
    model: Case,

    comparator: function(x, y) {
      var x_total = Number(x.get('total_payments')),
          y_total = Number(y.get('total_payments'))
      if (x_total < y_total)
        return 1;
      if (x_total > y_total)
        return -1;
      return 0;
    },

    getUniqueValuesForAttr: function(attribute) {
      return _.compact(_.uniq(this.map(function(x) { return x.get(attribute); })));
    }
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
    }
  });

  // OfficerSearchForm view
  var OfficerSearchForm = Backbone.View.extend({

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.cases = options.cases;
      this.caseList = options.caseList;
      this.officers = this.getOfficersCollection();
      this.initTypeahead();
      return this;
    },

    getOfficersCollection: function() {
      var officersForCases = this.cases.map(function(model) {
            var ret = model.get('officers');
            _.each(ret, function(off) {
              off.case_numbers = [model.get('case_number')];
            });
            return ret;
          }),
          officers = _.flatten(officersForCases, 1),
          uniqueOfficers = {};

      _.each(officers, function(val, key) {
        var sig = val.prefix + val.first + val.last + val.badge_number;
        if (typeof uniqueOfficers[sig] == 'undefined') {
          uniqueOfficers[sig] = val;
        } else {
          _.each(val.case_numbers, function(case_number, idx) {
            uniqueOfficers[sig].case_numbers.push(case_number);
          });
        }
      });

      return new Officers(_.values(uniqueOfficers));
    },

    initTypeahead: function() {
      var self = this;

      var source = new Bloodhound({
        local: this.officers.toJSON(),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace([
            'first', 'last', 'prefix', 'badge_number'
        ])
      });

      this.$el.find('.typeahead').typeahead({
        minLength: 3,
        highlight: true
      },
      {
        name: 'officers',
        display: function(obj) {
          var display = obj.prefix + ' ' + obj.first + ' ' + obj.last;
          if (obj.badge_number) {
            display += ' (badge: ' + obj.badge_number + ')';
          }
          return display;
        },
        source: source
      });

      this.$el.find('.typeahead').on('typeahead:select', this.filterCases.bind(this));
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

  // CaseSearchForm view
  var CaseSearchForm = Backbone.View.extend({

    events: {
      'change :input': 'handleChange'
    },

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.cases = options.cases;
      this.caseList = options.caseList

      this.initChosen();
      this.initSliders();
      return this;
    },

    handleChange: _.debounce(function() {
      this.filterData = this.$el.serializeObject();
      this.updateStatement();
      this.filterCases();
    }, 500),

    updateStatement: function() {
      //console.log('updateStatement');
    },

    filterCases: function() {
      var self = this,
          filteredCases = [];

      this.cases.each(function(model) {
        var ret = true;

        _.each(self.filterData, function(value, name) {
          if (value == '')
            return;

          if (['neighborhood', 'victim_1_race'].indexOf(name) >= 0) {
            if (name =='neighborhood' && model.get(name) !== value) {
              ret = false;
            }
            if (name =='victim_1_race' && typeof model.get('victims') !== 'undefined') {
              var victims = model.get('victims');
              if (victims.length && victims[0].victim_1_race !== value) {
                ret = false;
              }
            }
          }

          if (name == 'total_payments') {
            var paymentRange = value.split(','),
                low = Number(paymentRange[0]),
                high = Number(paymentRange[1]),
                caseTotalPayments = Number(model.get(name));

            if ( ! ( (caseTotalPayments >= low) && (caseTotalPayments <= high) ) ) {
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

    initSliders: function() {
      $('.slider.payment').slider({
        formatter: function(values) {
          return '$' + Number(values[0]).formatMoney() + ' - $' + Number(values[1]).formatMoney();
        }
      });
    },

    initChosen: function() {
      this.$el.find('select.chosen').chosen();
    }

  });

  var SearchSelector = Backbone.View.extend({
    events: {
      'click .tab-selector a': 'goToTab'
    },

    initialize: function(options) {
      this.cases = options.cases;
      this.caseList = options.caseList;
      Backbone.View.prototype.initialize.apply(this, arguments);
      return this;
    },

    goToTab: function(tabId) {
      var fragment;

      if (typeof tabId == 'string') {
        fragment = tabId;
      } else {
        fragment = $(tabId.currentTarget).attr('href').replace(Backbone.history.root, '');
      }

      this.$el.find('.tab-containers > .tab-container').hide();
      this.$el.find('[data-tab-id="' + fragment + '"]').show();

      if (fragment == 'cases') {
        if (typeof this.caseForm == 'undefined') {
          this.caseForm = new CaseSearchForm({
            cases: this.cases,
            el: '#case-search-form',
            caseList: this.caseList
          });
        }
        this.caseForm.filterCases();
      } else {
        if (typeof this.officerForm == 'undefined') {
          this.officerForm = new OfficerSearchForm({
            cases: this.cases,
            el: '#officer-search-form',
            caseList: this.caseList
          })
        }
        //this.officerForm.filterCases();
      }

      Backbone.history.navigate(fragment, { trigger: true });
      return false;
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
      root: '/search/'
    });
  });

})();
