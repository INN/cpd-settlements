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
@blueprint.route('/search/index.html')
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
        'payments': Payment.objects
    })

    return render_template('templates/search.html', **context)


@blueprint.route('/search/cases/')
@blueprint.route('/search/cases/index.html')
def search_cases():
    return search()


@blueprint.route('/search/officers/')
@blueprint.route('/search/officers/index.html')
def search_officers():
    return search('officers')


@blueprint.route('/officer/<slug>/')
@blueprint.route('/officer/<slug>/index.html')
def officer(slug):
    context = get_context('officer/%s' % slug)

    try:
        officer = filter(lambda x: x.get_slug() == slug, Officer.objects)[0]
        context['officer'] = officer
        context['title'] = "Cases and settlements involving %s %s %s | Chicago Reporter" % (
            officer.prefix, officer.first, officer.last)
        if officer.get('note', False):
            context['opengraph_description'] = officer.get('note')
    except IndexError:
        context['officer'] = False

    return render_template('templates/officer.html', **context)


@blueprint.route('/case/<slug>/')
@blueprint.route('/case/<slug>/index.html')
def case(slug):
    context = get_context('case/%s' % slug)

    try:
        case = filter(lambda x: x.get_slug() == slug, Case.objects)[0]
        context['case'] = case
        context['title'] = "Details for case %s | Chicago Reporter" % case.get('case_number')
        if case.get('narrative', False):
            context['opengraph_description'] = case.get('narrative')
    except IndexError:
        context['case'] = False

    return render_template('templates/case.html', **context)


"""
Utility functions
"""
def get_context(route):
    context = g.current_site.project.DEFAULT_CONTEXT.copy()
    context['route'] = route
    return context


def get_site_path():
    if g.current_site.app.config.get('BUILD_PATH', False):
        return '/cpd-settlements/'
    else:
        return '/'


def get_root_url():
    return g.current_site.project.DEFAULT_CONTEXT.get('ROOT_URL')


@blueprint.app_context_processor
def context_processor():
    """
    Add helper functions to context for all projects.
    """
    return {
        # Functions
        'enumerate': enumerate,
        'format_currency': format_currency,
        'total_for_payments': total_for_payments,

        # Variables
        'BUILD_PATH': g.current_site.app.config.get('BUILD_PATH', None),
        'site_path': get_site_path(),
        'title': 'Search the CPD settlement database | Chicago Reporter',
        'opengraph_image': (
            'http://' + get_root_url() +
            '/assets/cpd_settlements/images/02-IMG_9158.jpg'
        ),
        'opengraph_description': (
            'Between 2012 and 2015, the City of Chicago paid $212 million '
            'in settlements in police misconduct cases.'
        )
    }
