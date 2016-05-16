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
        } for officer in case.get_related_officers()]

        delete_these = [
            'city_attorney',
            'city_attorney_firm',
            'judge',
            'magistrate_judge',
            'plaintiff_attorney',
            'plaintiff_attorney_firm',
            'police_beat',
            'police_beat_id',
            'police_district',
            'police_district_id'
        ]

        for key in delete_these:
            try:
                del(case_dict[key])
            except KeyError:
                pass

        cases.append(case_dict)

    with open('assets/data/cases.js', 'w+') as f:
        f.write("var cases_json = %s;" % json.dumps(cases))


def render_officers_json():
    officers = []
    seen = []

    for officer in Officer.objects:
        if not officer.get('id', None):
            continue

        try:
            if (seen.index(officer.get('id')) >= 0):
                print "Already saw officer %s" % officer.get('id')
                continue
        except ValueError:
            # Total of all payments for the officer
            officer_payments = []
            for case_no in officer.case_numbers:
                officer_payments += Payment.objects.filter(case_number=case_no)

            officer['total_payments'] = total_for_payments(officer_payments, False)

            # Add the slug
            officer['slug'] = officer.get_slug()

            officers.append(officer)

            seen.append(officer.get('id'))

    with open('assets/data/officers.js', 'w+') as f:
        f.write("var officers_json = %s;" % json.dumps(officers))
