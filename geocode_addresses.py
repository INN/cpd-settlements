from geopy.geocoders import GoogleV3
from inc.models import Case

import time
import json


def main():
    cases = Case.objects
    cases_dicts = [case.to_struct() for case in cases]

    geocoder = GoogleV3()

    for case in cases_dicts:
        if case.get('address', None):
            print 'Trying to geocode address: ', case.get('address')
            result = geocoder.geocode('%s Chicago, IL' % case.get('address'))
            if result:
                case['latitude'] = result.latitude
                case['longitude'] = result.longitude
            else:
                print 'Could not geocode address: %s' % case.get('address')
            time.sleep(0.5)
        else:
            print "No address for case: %s" % case.get('case_number')

    with open('data/cases.geocoded.json', 'wb') as f:
        f.write(json.dumps(cases_dicts))


if __name__ == '__main__':
    main()
