#!/usr/bin/env python
# -*- coding: utf-8 -*-
from lib.render_json import render_officers_json, render_cases_json

if __name__ == '__main__':
    print "Rendering cases and officer front-end json..."
    render_officers_json()
    render_cases_json()
