import json

from flask import Blueprint, render_template, g
from cpd_settlements.inc.models import Case, Victims, Officer, Payment
from cpd_settlements.inc.helpers import format_currency, total_for_payments

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


@blueprint.route('/case/<case_number>')
def case(case_number):
    return 'Nothing here yet.'


@blueprint.route('/officers/')
def officers():
    context = get_context('officers')
    context['officers'] = Officer.objects
    return render_template('templates/officers.html', **context)


@blueprint.route('/search/')
def search():
    context = get_context('search')

    cases = Case.objects

    for case in cases:
        case.payments = case.get_related(Payment)
        case.officers = case.get_related(Officer)
        case.victims = case.get_related(Victims)

    context['cases'] = cases
    context['payments'] = Payment.objects
    return render_template('templates/search.html', **context)


@blueprint.route('/data/cases.json')
def cases_json():
    cases = []
    for case in Case.objects:
        case_dict = case.to_struct()

        # Total of all payments for the case
        case_dict['total_payments'] = total_for_payments(case.get_related(Payment), False)

        # Grab the race of the first victim named
        case_dict['victim_1_race'] = None
        victims = case.get_related(Victims)
        if victims and victims[0].victim_1_race:
            case_dict['victim_1_race'] = victims[0].victim_1_race

        cases.append(case_dict)

    return json.dumps(cases)


@blueprint.context_processor
def utility_processor():
    return {
        'format_currency': format_currency,
        'total_for_payments': total_for_payments
    }


def get_context(route):
    site = g.current_site
    context = site.get_context()
    context.update({
        'PATH': route
    })
    return context
