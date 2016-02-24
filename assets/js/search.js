(function() {
  var $ = jQuery;

  // Case model
  var Case = Backbone.Model.extend({});

  // Cases collection
  var Cases = Backbone.Collection.extend({
    model: Case,

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

  // SearchForm view
  var SearchForm = Backbone.View.extend({

    events: {
      'change :input': 'filterCases'
    },

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      this.cases = options.cases;
      this.populateFormFields();
      this.caseList = new CaseList({
        el: '#case-list-view'
      });
      return this;
    },

    filterCases: function() {
      var filterData = this.$el.serializeObject(),
          filteredCases = [];

      this.cases.each(function(model) {
        var ret = true;

        _.each(filterData, function(value, name) {
          if (value == '')
            return;

          if (['neighborhood', 'victim_1_race'].indexOf(name) >= 0) {
            if (model.get(name) !== value) {
              ret = false;
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

    bindFormEvents: function() {},

    initSliders: function() {
      $('.slider.payment').slider({
        formatter: function(values) {
          return '$' + Number(values[0]).formatMoney() + ' - $' + Number(values[1]).formatMoney();
        }
      });
    },

    getNeighborhoodCollection: function(cases) {
      var neighborhoods = {};

      cases.each(function(x) {
        if (typeof x.get('neighborhood') !== 'undefined') {
          if (typeof neighborhoods[x.get('neighborhood_id')] == 'undefined') {
            neighborhoods[x.get('neighborhood_id')] =  {
              neighborhood: x.get('neighborhood'),
              neighborhood_id: x.get('neighborhood_id')
            };
          }
        }
      });

      return new Neighborhoods(_.values(neighborhoods));
    },

    populateFormFields: function() {
      this.races = this.cases.getUniqueValuesForAttr('victim_1_race');
      this.populateMenu('victim_1_race', this.races);

      this.neighborhoods = this.getNeighborhoodCollection(this.cases);
      this.populateMenu('neighborhood', this.neighborhoods.map(function(x) {
        return x.get('neighborhood');
      }));

      this.initChosen();
      this.initSliders();
      this.bindFormEvents();
    },

    initChosen: function() {
      this.$el.find('select.chosen').chosen();
    },

    populateMenu: function(name, values) {
      var input = this.$el.find('[name="' + name + '"]');

      input.append('<option value="">Any</option>');

      _.each(values, function(val, idx) {
        var el = $('<option />');
        el.attr('value', val);
        el.html(val);
        input.append(el);
      });
    }
  });

  var fetchData = function() {
    $.ajax({
      url: '/data/cases.json',
      dataType: 'json',
      success: initSearchForm
    })
  };

  var initSearchForm = function(data) {
    var cases = new Cases(data);

    new SearchForm({
      cases: cases,
      el: '#search-form'
    });
  };

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
    fetchData();
  });

})();
