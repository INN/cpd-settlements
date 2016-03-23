# -*- coding: utf-8 -*-
import os

from base import BaseModel, ModelList
from jsonmodels import fields
from webhelpers.text import urlify


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
        'timestamp': 'Timestamp',
        'case_number': 'Case Number',
        'date_filed': 'Date Filed',
        'date_closed': 'Date Closed',
        'judge': 'Judge',
        'plaintiff_attorney': "Plaintiff's Lead Attorney",
        'plaintiff_attorney_firm': "Plaintiff's Attorney Law Firm",
        'city_attorney': "City's Lead Attorney",
        'city_attorney_firm': "City's Attorney Law Firm",
        'magistrate_judge': "Magistrate Judge",
        'date_of_incident': "Date of Incident",
        'location': 'Location Listed',
        'address': 'Street Address',
        'causes': 'Causes',
        'tags': 'Tags',
        'entered_by': 'Entered By'
    }

    timestamp = fields.StringField()
    case_number = fields.StringField()
    date_filed = fields.StringField()
    date_closed = fields.StringField()
    judge = fields.StringField()
    plaintiff_attorney = fields.StringField()
    plaintiff_attorney_firm = fields.StringField()
    city_attorney = fields.StringField()
    city_attorney_firm = fields.StringField()
    magistrate_judge = fields.StringField()
    date_of_incident = fields.StringField()
    location = fields.StringField()
    address = fields.StringField()
    causes = fields.StringField()
    tags = fields.StringField()

    # Address/location/geo fields
    neighborhood = fields.StringField()
    neighborhood_id = fields.StringField()

    community_area = fields.StringField()
    community_area_id = fields.StringField()

    latitude = fields.FloatField()
    longitude = fields.FloatField()


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

    timestamp = fields.StringField()
    case_number = fields.StringField()
    victim_1 = fields.StringField()
    victim_1_race = fields.StringField()
    victim_1_age = fields.StringField()
    victim_2 = fields.StringField()
    victim_3 = fields.StringField()
    victim_4 = fields.StringField()
    victim_5 = fields.StringField()
    victim_6 = fields.StringField()
    victim_7 = fields.StringField()
    victim_8 = fields.StringField()
    more_victims = fields.StringField()
    victim_1_deceased = fields.StringField()
    enterd_by = fields.StringField()


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

    case_number = fields.StringField()
    payee = fields.StringField()
    payment = fields.IntField()
    fees = fields.StringField()
    primary_cause = fields.StringField()
    disposition = fields.StringField()
    date_paid = fields.StringField()

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
        'timestamp': "Timestamp",
        'case_number': "Case number",
        'prefix': "Prefix",
        'first': "First Name",
        'middle': "Middle Initial",
        'last': "Last Name",
        'badge_number': "Badge Number",
        'attorney': "Officer's Lead Attorney",
        'attorney_firm': "Lead Attorney Law Firm",
        'entered_by': "Entered By"
    }

    timestamp = fields.StringField()
    case_number = fields.StringField()
    prefix = fields.StringField()
    first = fields.StringField()
    middle = fields.StringField()
    last = fields.StringField()
    badge_number = fields.StringField()
    attorney = fields.StringField()
    attorney_firm = fields.StringField()
    entered_by = fields.StringField()

    def get_slug(self):
        return urlify(
            "%s %s %s %s %s" % (self.prefix, self.first, self.middle, self.last, self.case_number))


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
