#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from jinja2 import Environment, FileSystemLoader
from inc.models import Case

template_dir = os.path.dirname(os.path.realpath(__file__))
env = Environment(loader=FileSystemLoader(template_dir))


def render_includes():
    cases = Case.objects
    neighborhoods = {}
    primary_causes = []

    for case in cases:
        try:
            if (not neighborhoods.get(case.neighborhood_id, None)
                    and case.neighborhood and case.neighborhood.strip() != ''):
                neighborhoods[case.neighborhood_id] = {
                    'neighborhood': case.neighborhood,
                    'neighborhood_id': case.neighborhood_id
                }
        except AttributeError:
            pass

        try:
            case.primary_cause = case.payments[0].primary_cause
            primary_causes.append(case.payments[0].primary_cause)
        except IndexError:
            pass

    template = env.get_template('templates/_case_search_form.html')

    with open('templates/_case_search_form.html', 'w+') as f:
        f.write(template.render(**{
            'neighborhoods': neighborhoods,
            'primary_causes': primary_causes
        }))
