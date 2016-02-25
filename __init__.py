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
    neighborhoods = {}
    races = []

    for case in cases:
        case.payments = case.get_related(Payment)
        case.officers = case.get_related(Officer)
        case.victims = case.get_related(Victims)

        if not neighborhoods.get(case.neighborhood_id, None) and case.neighborhood and case.neighborhood.strip() != '':
            neighborhoods[case.neighborhood_id] = {
                'neighborhood': case.neighborhood,
                'neighborhood_id': case.neighborhood_id
            }

            if case.victims[0] and case.victims[0].victim_1_race:
                races.append(case.victims[0].victim_1_race)

    context['cases'] = sorted(
        cases, key=lambda x: total_for_payments(x.payments, False), reverse=True)
    context['payments'] = Payment.objects
    context['cases_json'] = cases_json()
    context['races'] = sorted(list(set(races)))
    context['neighborhoods'] = sorted(
        neighborhoods.values(), key=lambda x: x.get('neighborhood'))
    return render_template('templates/search.html', **context)


@blueprint.route('/search/cases')
def search_cases():
    return search()


@blueprint.route('/search/officers')
def search_officers():
    return search()


# Utility functions
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
