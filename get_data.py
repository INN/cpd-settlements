#!/usr/bin/env python
# -*- coding: utf-8 -*-
from lib.download_data import download_data
from lib.geocode_addresses import geocode_addresses
from lib.boundaries_for_points import boundaries_for_points
from lib.prep_officer_data import prep_officer_data


if __name__ == '__main__':
    print "Downloading data..."
    download_data()
    print "Prep officer data"
    prep_officer_data()
    print "Geocoding addresses..."
    geocode_addresses()
    print "Get boundaries for points..."
    boundaries_for_points()
