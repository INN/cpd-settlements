# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, g
from urlparse import urlparse

from .inc.models import Case, Officer, Payment
from .inc.helpers import format_currency, total_for_payments

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
    primary_causes = []

    for case in cases:
        try:
            if (not neighborhoods.get(case.neighborhood_id, None)
                    and case.neighborhood and case.neighborhood.strip() != ''):
                neighborhoods[case.neighborhood_id] = {
                    'neighborhood': case.neighborhood,
                    'neighborhood_id': case.neighborhood_id
                }
        except AttributeError:
            pass

        try:
            case.primary_cause = case.payments[0].primary_cause
            primary_causes.append(case.payments[0].primary_cause)
        except IndexError:
            pass

    context.update({
        'init_view': init_view,
        'cases': sorted(
            cases, key=lambda x: total_for_payments(x.payments, False), reverse=True),
        'neighborhoods': sorted(
            neighborhoods.values(), key=lambda x: x.get('neighborhood')),
        'officers': Officer.objects,
        'payments': Payment.objects,
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


@blueprint.app_context_processor
def context_processor():
    """
    Add helper functions to context for all projects.
    """
    return {
        'enumerate': enumerate,
        'format_currency': format_currency,
        'total_for_payments': total_for_payments,
        'BUILD_PATH': g.current_site.app.config.get('BUILD_PATH', None)
    }
