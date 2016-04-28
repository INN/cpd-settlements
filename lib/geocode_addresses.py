# -*- coding: utf-8 -*-
from geopy.geocoders import GoogleV3
from inc.base import ModelList
from inc.models import Case

import time
import json


def main():
    geocode_addresses()


def geocode_addresses():
    cases = ModelList('data/cases.json', Case, Case.field_map)
    cases_dicts = [case for case in cases]

    geocoder = GoogleV3(timeout=30)

    for case in cases_dicts:
        if case.get('address', None):
            print 'Trying to geocode address:', case.get('address')
            result = geocoder.geocode('%s Chicago, IL' % case.get('address'))
            if result:
                case['latitude'] = result.latitude
                case['longitude'] = result.longitude
            else:
                print 'Could not geocode address:', case.get('address')
        else:
            print "No address for case: %s" % case.get('case_number')

        time.sleep(1)

    with open('data/cases.geocoded.json', 'wb') as f:
        f.write(json.dumps(cases_dicts))


if __name__ == '__main__':
    main()
