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

  // Functions for setting up the search form
  var setupSliders = function() {
    $('.slider').slider({
      formatter: function(value) {
        return 'Current value: ' + value;
      }
    });
  };

  var getNeighborhoodCollection = function(cases) {
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
  };

  var populateFormFields = function(cases) {
    var races = cases.getUniqueValuesForAttr('victim_1_race');
    populateMenu('victim_race', races);

    var neighborhoods = getNeighborhoodCollection(cases);
    populateMenu('neighborhood', neighborhoods.map(function(x) {
      return x.get('neighborhood');
    }));
  };

  var populateMenu = function(name, values) {
    var input = $('[name="' + name + '"]');
    _.each(values, function(val, idx) {
      var el = $('<option />');
      el.attr('value', val);
      el.html(val);
      input.append(el);
    });
  }

  var fetchData = function() {
    $.ajax({
      url: '/data/cases.json',
      dataType: 'json',
      success: function(data) {
        var cases = new Cases(data);
        populateFormFields(cases);
      }
    })
  };

  Number.prototype.formatMoney = function(c, d, t){
    var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  };

  $(document).ready(function() {
    setupSliders();
    fetchData();
  });

})();
