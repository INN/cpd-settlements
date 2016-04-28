import json

from inc.models import Case, Victims, Officer, Payment
from inc.helpers import total_for_payments


def render_cases_json():
    cases = []
    for case in Case.objects:
        case_dict = case

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

    with open('assets/data/cases.js', 'w+') as f:
        f.write("var cases_json = %s;" % json.dumps(cases))


def render_officers_json():
    officers = []
    for officer in Officer.objects:
        officer_dict = officer

        # Total of all payments for the officer
        officer_dict['total_payments'] = total_for_payments(officer.get_related(Payment), False)

        # Add the slug
        officer_dict['slug'] = officer.get_slug()

        officers.append(officer_dict)

    with open('assets/data/officers.js', 'w+') as f:
        f.write("var officers_json = %s;" % json.dumps(sorted(
            officers, lambda x, y: cmp(x.get('last'), y.get('last')))))
