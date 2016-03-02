# -*- coding: utf-8 -*-
import requests
import json
import time


def main():
    boundaries_for_points()


def boundaries_for_points():
    with open('data/cases.geocoded.json', 'r') as f:
        cases = json.loads(f.read())

        for case in cases:
            lat, lng = case.get('latitude'), case.get('longitude')

            if lat and lng:
                print "Boundary lookup for %s,%s" % (lat, lng)
                boundary_data = boundary_lookup(lat, lng)

                if boundary_data:
                    case.update(boundary_data)

                time.sleep(1)
            else:
                print 'Skipping: missing lat or lng for %s' % case.get('case_number')

        with open('data/cases.geocoded.boundaries.json', 'wb') as f:
            f.write(json.dumps(cases))


def boundary_lookup(lat, lng):
    url = 'http://boundaries.tribapps.com/1.0/boundary/' + \
        '?contains=%s,%s&sets=community-areas,neighborhoods' % (lat, lng)
    result = requests.get(url)
    data = json.loads(result.content)
    ret = {}
    if result.status_code == 200:
        for bound in data.get('objects'):
            if bound.get('kind') == 'Community Area':
                ret.update({
                    u'community_area': bound.get('name'),
                    u'community_area_id': bound.get('external_id'),
                })
            if bound.get('kind') == 'Neighborhood':
                ret.update({
                    u'neighborhood': bound.get('name'),
                    u'neighborhood_id': bound.get('external_id'),
                })
            if bound.get('kind') == 'Police Beat':
                ret.update({
                    'police_beat': bound.get('name'),
                    'police_beat_id': bound.get('external_id')
                })
            if bound.get('kind') == 'Police District':
                ret.update({
                    'police_district': bound.get('name'),
                    'police_district_id': bound.get('external_id')
                })
    else:
        print "Couldn't retrieve boundaries for: %s,%s" % (lat, lng)

    return ret


if __name__ == '__main__':
    main()
