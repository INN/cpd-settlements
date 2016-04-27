# -*- coding: utf-8 -*-
import json

from flask import Blueprint, render_template, g
from GenericCache import GenericCache
from GenericCache.decorators import cached
from urlparse import urlparse

from .inc.models import Case, Victims, Officer, Payment
from .inc.helpers import (
    format_currency, total_for_payments, JavascriptIncluder, CSSIncluder)

blueprint = Blueprint(
    __name__,
    __name__,
    static_folder='assets',
    static_url_path='/assets/%s' % __name__
)

cache = GenericCache()


"""
ROUTES
"""
@blueprint.route('/search/')
def search(init_view='cases'):
    context = get_context('search')

    cases = Case.objects
    neighborhoods = {}
    races = []
    primary_causes = []

    for case in cases:
        case.payments = case.get_related(Payment)
        case.officers = case.get_related(Officer)
        case.victims = case.get_related(Victims)
        case.slug = case.get_slug()

        if not neighborhoods.get(case.neighborhood_id, None) and case.neighborhood and case.neighborhood.strip() != '':
            neighborhoods[case.neighborhood_id] = {
                'neighborhood': case.neighborhood,
                'neighborhood_id': case.neighborhood_id
            }

        try:
            races.append(case.victims[0].victim_1_race)
        except IndexError:
            pass

        try:
            case.primary_cause = case.payments[0].primary_cause
            primary_causes.append(case.payments[0].primary_cause)
        except IndexError:
            pass

    officers = Officer.objects

    for officer in officers:
        officer.total_payments = total_for_payments(officer.get_related(Payment), False)
        officer.slug = officer.get_slug()

    context.update({
        'init_view': init_view,
        'cases': sorted(
            cases, key=lambda x: total_for_payments(x.payments, False), reverse=True),
        'neighborhoods': sorted(
            neighborhoods.values(), key=lambda x: x.get('neighborhood')),
        'officers': officers,
        'payments': Payment.objects,
        'primary_causes': sorted(list(set(primary_causes))),
        'races': sorted(list(set(races))),
        'site_path': get_site_path()
    })

    return render_template('templates/search.html', **context)


@blueprint.route('/search/cases/')
def search_cases():
    return search()


@blueprint.route('/search/officers/')
def search_officers():
    return search('officers')


@blueprint.route('/officer/<slug>/')
def officer(slug):
    context = get_context('officer')

    try:
        context['officer'] = filter(lambda x: x.get_slug() == slug, Officer.objects)[0]
    except IndexError:
        context['officer'] = False

    return render_template('templates/officer.html', **context)


@blueprint.route('/case/<slug>/')
def case(slug):
    context = get_context('case')

    try:
        context['case'] = filter(lambda x: x.get_slug() == slug, Case.objects)[0]
    except IndexError:
        context['case'] = False

    return render_template('templates/case.html', **context)


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


def get_site_path():
    if g.current_site.app.config.get('FREEZER_BASE_URL', False):
        return urlparse(g.current_site.app.config.get('FREEZER_BASE_URL')).path
    else:
        return '/'


@cached(cache)
def cases_json():
    cases = []
    for case in Case.objects:
        case_dict = case.to_struct()

        # Get the slug
        case_dict['slug'] = case.get_slug()

        # Total of all payments for the case
        case_dict['total_payments'] = total_for_payments(case.get_related(Payment), False)

        # Get primary cause
        if case.get_related(Payment):
            case_dict['primary_cause'] = case.get_related(Payment)[0].primary_cause

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
            'badge_number': officer.badge_number,
            'slug': officer.get_slug()
        } for officer in case.get_related(Officer)]

        cases.append(case_dict)

    return json.dumps(cases)


@cached(cache)
def officers_json():
    officers = []
    for officer in Officer.objects:
        officer_dict = officer.to_struct()

        # Total of all payments for the officer
        officer_dict['total_payments'] = total_for_payments(officer.get_related(Payment), False)

        # Add the slug
        officer_dict['slug'] = officer.get_slug()

        officers.append(officer_dict)

    return json.dumps(sorted(
        officers, lambda x, y: cmp(x.get('last'), y.get('last'))))


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
        'total_for_payments': total_for_payments,
        'cases_json': cases_json,
        'officers_json': officers_json
    }
