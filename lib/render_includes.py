#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from jinja2 import Environment, FileSystemLoader
from inc.models import Case

template_dir = os.path.dirname(os.path.realpath(__file__))
env = Environment(loader=FileSystemLoader(template_dir))


def render_includes():
    cases = Case.objects
    neighborhoods = []
    primary_causes = []

    # Tag stuff
    tags = {
        'interaction_type': {
            'tags': set()
        },
        'officers_tags': {
            'tags': set()
        },
        'victims_tags': {
            'tags': set()
        },
        'misconduct_type': {
            'tags': set()
        },
        'weapons_used': {
            'tags': set()
        },
        'outcome': {
            'tags': set()
        }
    }

    for case in cases:
        try:
            neighborhoods.index(case.neighborhood)
        except ValueError:
            if (case.neighborhood and case.neighborhood.strip() != ''):
                neighborhoods.append(case.neighborhood)
        except AttributeError:
            pass

        try:
            primary_causes.append(case.primary_cause)
        except IndexError:
            pass

        for category in tags.keys():
            category_vals_for_case = case.get(category)

            for val in category_vals_for_case.replace(', ', '|').split('|'):
                if val:
                    tags[category]['tags'].add(val)

    template = env.get_template('templates/_case_search_form.html')

    with open('templates/_case_search_form.html', 'w+') as f:
        f.write(template.render(**{
            'neighborhoods': sorted(set(neighborhoods)),
            'primary_causes': sorted(set(primary_causes)),
            'tags': tags
        }))
