#!/usr/bin/env python
# -*- coding: utf-8 -*-
from lib.download_data import download_data
from lib.geocode_addresses import geocode_addresses
from lib.boundaries_for_points import boundaries_for_points


if __name__ == '__main__':
    print "Downloading data..."
    download_data()
    print "Geocoding addresses..."
    geocode_addresses()
    print "Get boundaries for points..."
    boundaries_for_points()
