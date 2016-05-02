# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

# Google spreadsheet key
# SPREADSHEET_KEY = "None"

# Exclude these files from publication
EXCLUDES = [
    "*.md",
    "requirements.txt",
    "bower.json",
    "node_modules",
    "Gruntfile.js",
    "package.json",
    ".bowerrc",
    ".git*",
    "templates",
    "assets",
    "data",
    "inc",
    "lib",
    "less"
]

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    "production": "apps.inn.org/cpd-settlements",
    "staging": "stage-apps.inn.org/cpd-settlements",
}

import sys
from tarbell.settings import Settings
from tarbell.hooks import register_hook

sys.path.append(Settings().config.get('projects_path'))

from cpd_settlements import blueprint
from cpd_settlements.inc.models import Officer, Case

@register_hook('generate')
def app_setup(site, output_root, extra_context):

    @site.freezer.register_generator
    def officer_urls():
        for officer in Officer.objects:
            yield 'cpd_settlements.officer', {'slug': officer.slug}

    @site.freezer.register_generator
    def case_urls():
        for case in Case.objects:
            yield 'cpd_settlements.case', {'slug': case.slug}

    site.app.config['FREEZER_IGNORE_404_NOT_FOUND'] = True
