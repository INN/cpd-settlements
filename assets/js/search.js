(function() {
  var $ = jQuery,
      data = [];

  var initTypeahead = function(cases, officers, victims, payments) {
    cases = cases[0],
    officers = officers[0],
    victims = victims[0],
    payments = payments[0];

    // Cases
    var first = _.first(cases),
        cases_data = new Bloodhound({
          local: cases,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace(_.keys(first))
        });

    // Officers
    var first = _.first(officers),
        officers_data = new Bloodhound({
          local: officers,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace(_.keys(first))
        });

    // Victims
    var first = _.first(victims),
        victims_data = new Bloodhound({
          local: victims,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace(_.keys(first))
        });

    // Payments
    var first = _.first(payments),
        payments_data = new Bloodhound({
          local: payments,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace(_.keys(first))
        });

    $('.typeahead').typeahead({
      hint: false,
      minLength: 1,
      highlight: true
    },
    {
      name: 'cases',
      displayKey: 'case_number',
      source: cases_data,
      templates: {
        header: '<h3 class="th-header">Case numbers</h3>'
      }
    },
    {
      name: 'officers',
      displayKey: 'badge_number',
      source: officers_data,
      templates: {
        header: '<h3 class="th-header">Officer badge number</h3>'
      }
    },
    {
      name: 'victims',
      displayKey: 'victim_1',
      source: victims_data,
      templates: {
        header: '<h3 class="th-header">Victims</h3>'
      }
    },
    {
      name: 'payments',
      displayKey: 'payee',
      source: payments_data,
      templates: {
        header: '<h3 class="th-header">Payees</h3>'
      }
    });
  };

  var fetchData = function() {
    $.when.apply($.when, [
      $.ajax({
        dataType: "json",
        url: '/data/cases.json'
      }),
      $.ajax({
        dataType: "json",
        url: '/data/officers.json'
      }),
      $.ajax({
        dataType: "json",
        url: '/data/victims.json'
      }),
      $.ajax({
        dataType: "json",
        url: '/data/payments.json'
      })
    ]).done(initTypeahead);
  };

  $(document).ready(fetchData);

})();
