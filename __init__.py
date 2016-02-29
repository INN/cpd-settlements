# -*- coding: utf-8 -*-
import json

from flask import Blueprint, render_template, g

from .inc.models import Case, Victims, Officer, Payment
from .inc.helpers import (
    format_currency, total_for_payments, JavascriptIncluder, CSSIncluder)

blueprint = Blueprint(
    __name__,
    __name__,
    static_folder='assets',
    static_url_path='/assets/%s' % __name__
)


"""
ROUTES
"""
@blueprint.route('/search/')
def search(init_view='cases'):
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

    context['init_view'] = init_view
    context['cases'] = sorted(
        cases, key=lambda x: total_for_payments(x.payments, False), reverse=True)
    context['payments'] = Payment.objects
    context['cases_json'] = cases_json()
    context['races'] = sorted(list(set(races)))
    context['neighborhoods'] = sorted(
        neighborhoods.values(), key=lambda x: x.get('neighborhood'))
    return render_template('templates/search.html', **context)


@blueprint.route('/search/cases/')
def search_cases():
    return search()


@blueprint.route('/search/officers/')
def search_officers():
    return search('officers')


"""
Utility functions
"""
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

        # Grab the victim data
        case_dict['victims'] = [{
            'victim_1': victim.victim_1,
            'victim_1_race': victim.victim_1_race
        } for victim in case.get_related(Victims)]

        # Grab officers involved
        case_dict['officers'] = [{
            'first': officer.first,
            'last': officer.last,
            'prefix': officer.prefix,
            'badge_number': officer.badge_number
        } for officer in case.get_related(Officer)]

        cases.append(case_dict)

    return json.dumps(cases)


@blueprint.app_context_processor
def context_processor():
    """
    Add helper functions to context for all projects.
    """
    return {
        'JS': JavascriptIncluder(blueprint=blueprint),
        'CSS': CSSIncluder(blueprint=blueprint),
        'enumerate': enumerate,
        'format_currency': format_currency,
        'total_for_payments': total_for_payments
    }
