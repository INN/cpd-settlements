# -*- coding: utf-8 -*-
import os

from base import BaseModel, ModelList
from webhelpers.text import urlify
from helpers import total_for_payments


class NonMappedModelList(ModelList):
    def __init__(self, source=None, klass=None):
        self.klass = klass
        self.source = source
        if source and klass:
            self._load_models()

    def _load_models(self):
        data = self._load_json()

        models = []
        for d in data:
            models.append(self.klass(**d))

        self.extend(models)


class Case(BaseModel):

    type = 'cases'

    field_map = {
        'case_number': 'CaseNumber',
        'date_filed': 'DateFiled',
        'date_closed': 'DateClosed',
        'judge': 'Judge',
        'plaintiff_attorney': "PlaintiffsLeadAttorney",
        'plaintiff_attorney_firm': "PlaintiffsAttorneyLawFirm",
        'city_attorney': "CitysLeadAttorney",
        'city_attorney_firm': "CitysAttorneyLawFirm",
        'magistrate_judge': "MagistrateJudge",
        'date_of_incident': "DateofIncident",
        'location': 'LocationListed',
        'address': 'StreetAddress',
        'primary_cause': 'primary_cause',
        'tags': 'tags',
        'narrative': 'Narrative',
        # Tags
        'interaction_type': 'interaction_type',
        'officers_tags': 'officers',
        'victims_tags': 'victims',
        'misconduct_type': 'misconduct_type',
        'weapons_used': 'weapons_used',
        'outcome': 'outcome',
    }

    def get_slug(self):
        return urlify("%s" % self.case_number)

    def get_related_officers(self):
        result = []

        for officer in Officer.objects:
            if self.case_number in officer.case_numbers:
                result.append(officer)

        return result


class Victims(BaseModel):

    type = 'victims'

    field_map = {
        'timestamp': "Timestamp",
        'case_number': "Case number",
        'victim_1': "Victim 1",
        'victim_1_race': "Victim 1 Race",
        'victim_1_age': "Victim 1 Age (If known)",
        'victim_2': "Victim 2",
        'victim_3': "Victim 3",
        'victim_4': "Victim 4",
        'victim_5': "Victim 5",
        'victim_6': "Victim 6",
        'victim_7': "Victim 7",
        'victim_8': "Victim 8",
        'more_victims': "More Victims?",
        'victim_1_deceased': "Victim 1 Deceased",
        'enterd_by': "Entered By"
    }


class Payment(BaseModel):

    type = 'payments'

    field_map = {
        'case_number': "case_num",
        'payee': "payee",
        'payment': "payment",
        'fees': "fees_costs",
        'primary_cause': "primary_case",
        'disposition': "disposition",
        'date_paid': "date_paid"
    }

    @staticmethod
    def process_field(field, value):
        if field == 'payment':
            value = value.replace(',', '').strip()
            if value == '':
                return None
            else:
                return int(value)
        return value

    @staticmethod
    def sorted_payments():
        return sorted(Payment.objects, lambda x, y: cmp(y.payment, x.payment))


class Officer(BaseModel):

    type = 'officers'

    def get_slug(self):
        return urlify(self.id)


# Add a ModelList to each model
to_load = {
    'cases.geocoded.boundaries.json': Case,
    'victims.json': Victims,
    'payments.json': Payment,
    'officers.json': Officer
}

for filename, model in to_load.items():
    filepath = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/%s' % filename))

    if filename in ['officers.json', 'cases.geocoded.boundaries.json']:
        model.objects = NonMappedModelList(filepath, model)
    else:
        model.objects = ModelList(filepath, model, model.field_map)

# Do some heavy lifting up-front so this stuff gets stashed in memory
for case in Case.objects:
    case.payments = case.get_related(Payment)
    case.officers = case.get_related_officers()
    case.victims = case.get_related(Victims)
    case.slug = case.get_slug()

for officer in Officer.objects:
    officer_payments = []
    for case_no in officer.case_numbers:
        officer_payments += Payment.objects.filter(case_number=case_no)
    officer.total_payments = total_for_payments(officer_payments, False)
    officer.slug = officer.get_slug()
