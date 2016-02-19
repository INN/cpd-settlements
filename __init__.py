from flask import Blueprint, render_template, g
from cpd_settlements.inc.models import Case, Victims, Officer, Payment

blueprint = Blueprint(
    'cpd_settlements',
    __name__,
    static_folder='assets',
    static_url_path='/assets'
)

@blueprint.route('/cases/')
def cases():
    context = get_context('cases')
    context['cases'] = Case.objects
    return render_template('templates/cases.html', **context)


@blueprint.route('/officers/')
def officers():
    context = get_context('officers')
    context['officers'] = Officer.objects
    return render_template('templates/officers.html', **context)


@blueprint.route('/payments/')
def payments():
    context = get_context('payment')
    context['payments'] = Payment.objects
    return render_template('templates/payments.html', **context)


@blueprint.route('/payment/<case_number>')
def payment(case_number):
    context = get_context('payment')
    context['payments'] = Payment.objects.filter(case_number=case_number)
    context['case_number'] = case_number

    officers = []

    for payment in context['payments']:
        temp = filter(lambda x: x.case_number == case_number, Officer.objects)
        if temp:
            officers.extend(temp)

    context['officers'] = officers
    return render_template('templates/payment.html', **context)


@blueprint.route('/victims/')
def victims():
    context = get_context('victims')
    context['victims'] = Victims.objects
    return render_template('templates/victims.html', **context)


@blueprint.route('/search/')
def search():
    context = get_context('search')
    context['payments'] = Payment.sorted_payments()
    return render_template('templates/search.html', **context)


@blueprint.route('/data/<filename>.json')
def data(filename):
    if filename == 'cases':
        return Case.objects.to_json()
    if filename == 'victims':
        return Victims.objects.to_json()
    if filename == 'officers':
        return Officer.objects.to_json()
    if filename == 'payments':
        return Payment.objects.to_json()


@blueprint.context_processor
def utility_processor():
    def format_currency(amount):
        if not amount:
            amount = '0'
        return '${:,.2f}'.format(int(amount))
    return dict(format_currency=format_currency)


def get_context(route):
    site = g.current_site
    context = site.get_context()
    context.update({
        'PATH': route
    })
    return context
