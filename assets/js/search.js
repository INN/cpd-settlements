(function() {
  var $ = jQuery,
      data = [];

  var initTypeahead = function(payments) {

    _.each(payments, function(payment, idx) {
      payment.payment = '$' + Number(payment.payment).formatMoney(2, '.', ',');
    });

    // Payments
    var first = _.first(payments),
        payments_data = new Bloodhound({
          local: payments,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace([
            'payment', 'payee', 'case_number', 'disposition'])
        });

    $('.typeahead').typeahead({
      minLength: 1,
      highlight: true
    },
    {
      name: 'payments',
      limit: 9999,
      display: function(result) {
        return result.payee + ' (' + result.payment + ')';
      },
      source: payments_data,
      templates: {
        header: '<h3 class="th-header">Payees and amounts</h3>'
      }
    });

    $('.typeahead').on('typeahead:render', _.debounce(filterList, 500));
  };

  var filterList = function(event) {
    $('.results-inner .payment').hide();

    var results = _.rest(arguments),
        case_numbers = _.map(results, function(x) { return x.case_number; });

    $('.results-inner .payment').each(function() {
      var case_number = $(this).data('case_number');
      if (_.indexOf(case_numbers, case_number) >= 0) {
        $(this).show();
      }
    });
  };

  var fetchData = function() {
    $.when.apply($.when, [
      $.ajax({
        dataType: "json",
        url: '/data/payments.json'
      })
    ]).done(initTypeahead);
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

  //$(document).ready(fetchData);

})();
