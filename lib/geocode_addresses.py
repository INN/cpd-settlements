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

    geocoder = GoogleV3(timeout=800) # if the geocoder hits the API limit, add an api_key='YOUR-KEY-HERE' attribute with a new key from https://developers.google.com/maps/documentation/geocoding/get-api-key
    
    for case in cases_dicts: # if the connection times out running the whole dataset, limit the rows (example: cases_dicts[863:950] ) and collect the json manually via the print statement below
        if case.get('address', None):
            #print 'Trying to geocode address:', case.get('address')
            result = geocoder.geocode('%s Chicago, IL' % case.get('address'))
            if result:
                case['latitude'] = result.latitude
                case['longitude'] = result.longitude
            #else:
                #print 'Could not geocode address:', case.get('address')
        #else:
            #print "No address for case: %s" % case.get('case_number')

        print json.dumps(case) # print something useful so if the connection times out you still have the data know what case it choked on

        time.sleep(1)

    with open('data/cases.geocoded.json', 'wb') as f:
        f.write(json.dumps(cases_dicts))


if __name__ == '__main__':
    main()
