from flask import Blueprint, render_template, g
from cpd_settlements.inc.models import Case, Victims, Officer, Payment

blueprint = Blueprint(
    'cpd_settlements',
    __name__,
    static_folder='assets',
    static_url_path='/assets'
)


@blueprint.route('/search/')
def search():
    context = get_context('search')
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


def get_context(route):
    site = g.current_site
    context = site.get_context()
    context.update({
        'PATH': route
    })
    return context
