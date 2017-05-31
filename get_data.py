#!/usr/bin/env python
# -*- coding: utf-8 -*-
from lib.download_data import download_data
from lib.geocode_addresses import geocode_addresses
from lib.boundaries_for_points import boundaries_for_points
from lib.prep_officer_data import prep_officer_data
from lib.render_json import render_officers_json, render_cases_json
from lib.render_includes import render_includes


if __name__ == '__main__':
    print "Downloading data..."
    download_data()
    print "Prep officer data"
    prep_officer_data()
    """
    print "Geocoding addresses..."
    geocode_addresses()
    try:
        print "Get boundaries for points..."
        #boundaries_for_points()
    except:
        print "ERROR: Unable to get boundaries for points. Is the boundary service running?"
        print "Exiting..."
        exit()
    """
    print "Rendering cases and officer front-end json..."
    render_cases_json()
    render_officers_json()
    print "Rendering case search form include..."
    render_includes()
