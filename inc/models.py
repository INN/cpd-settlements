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
        'causes': 'Causes',
        'tags': 'Tags',
        'narrative': 'Narrative'
    }

    def get_slug(self):
        return urlify("%s" % self.case_number)


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

    field_map = {
        'timestamp': "matched_when",
        'appointed': 'appointed_date',
        'resigned': 'resignation_date',
        'attorney': "officer_atty",
        'attorney_firm': "officer_atty_firm",
        'prefix': "position_desc",
        'badge_number': 'badge_no',
        'case_number': 'case_no',
        'id': 'cop',
        'first': 'first_name',
        'middle': 'middle_init',
        'last': 'last_name',
    }

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

    if filename == 'cases.geocoded.boundaries.json':
        model.objects = NonMappedModelList(filepath, model)
    else:
        model.objects = ModelList(filepath, model, model.field_map)

# Do some heavy lifting up-front so this stuff gets stashed in memory
for case in Case.objects:
    case.payments = case.get_related(Payment)
    case.officers = case.get_related(Officer)
    case.victims = case.get_related(Victims)
    case.slug = case.get_slug()

for officer in Officer.objects:
    officer.total_payments = total_for_payments(officer.get_related(Payment), False)
    officer.slug = officer.get_slug()
