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

    for case in cases:
        try:
            neighborhoods.index(case.neighborhood_id)
        except ValueError:
            if (case.neighborhood and case.neighborhood.strip() != ''):
                neighborhoods.append(case.neighborhood_id)
        except AttributeError:
            pass

        try:
            primary_causes.append(case.payments[0].primary_cause.strip())
        except IndexError:
            pass

    template = env.get_template('templates/_case_search_form.html')

    with open('templates/_case_search_form.html', 'w+') as f:
        f.write(template.render(**{
            'neighborhoods': sorted(set(neighborhoods)),
            'primary_causes': sorted(set(primary_causes))
        }))
