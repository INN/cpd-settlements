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
    ".git*"
]

# Spreadsheet cache lifetime in seconds. (Default: 4)
# SPREADSHEET_CACHE_TTL = 4

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# Get context from a local file or URL. This file can be a CSV or Excel
# spreadsheet file. Relative, absolute, and remote (http/https) paths can be
# used.
# CONTEXT_SOURCE_FILE = ""

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
sys.path.append(Settings().config.get('projects_path'))

from cpd_settlements import blueprint
