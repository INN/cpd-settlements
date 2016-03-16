# -*- coding: utf-8 -*-
import codecs
import os

from cssmin import cssmin
from flask.helpers import url_for
from jinja2 import Markup
from slimit import minify
from tarbell.utils import ensure_directory
from flask import g


"""
Asset inclusion

Based on: https://github.com/ajam/tarbell-big-read-template
"""
class Includer(object):
    """
    Base class for Javascript and CSS psuedo-template-tags.
    See `make_context` for an explanation of `asset_depth`.
    """
    def __init__(self, blueprint=None):
        self.includes = []
        self.tag_string = None
        self.blueprint = blueprint

    def push(self, path):
        self.includes.append(path)

        return ''

    def _compress(self):
        raise NotImplementedError()

    def _get_path(self, path):
        if self.blueprint and self.blueprint.static_folder:
            blueprint_static = os.path.join(self.blueprint.static_folder, path)
            if os.path.isfile(blueprint_static):
                return blueprint_static

        blueprint_root = os.path.dirname(os.path.realpath(__file__))

        project_path = os.path.join(blueprint_root, '../', path)
        if os.path.isfile(project_path):
            return project_path

        blueprint_path = os.path.join(blueprint_root, path)
        if os.path.isfile(blueprint_path):
            return blueprint_path

    def render(self, path):
        config = g.current_site.app.config

        # If we're in a build context, mash everything together
        if config.get('BUILD_PATH'):
            if self.blueprint and self.blueprint.static_folder:
                static_folder = self.blueprint.static_folder
                fullpath = os.path.join(
                    config.get('BUILD_PATH'), os.path.basename(static_folder), path)
                localpath = os.path.join(os.path.basename(static_folder), path)
                url_for_asset = url_for('%s.static' % self.blueprint.name, filename=path)
            else:
                fullpath = os.path.join(config.get('BUILD_PATH'), path)
                url_for_asset = path

            ensure_directory(fullpath)
            with codecs.open(fullpath, 'w', encoding='utf-8') as f:
                f.write(self._compress())

            # If we're using a blueprint static folder, we need to have a copy of the file
            # in the project path (not build path) in order for frozen flask to work properly.
            if localpath:
                ensure_directory(localpath)
                with codecs.open(localpath, 'w', encoding='utf-8') as f:
                    f.write(self._compress())

            response = self.tag_string.format(url_for_asset)
        else:
            if self.blueprint and self.blueprint.static_folder:
                self.includes = [
                    url_for('%s.static' % self.blueprint.name, filename=src)
                    for src in self.includes
                ]
            response = '\n'.join([self.tag_string.format(src) for src in self.includes])

        markup = Markup(response)

        del self.includes[:]

        return markup


class JavascriptIncluder(Includer):
    """
    Psuedo-template tag that handles collecting Javascript and
    serving appropriate clean or compressed versions.
    """
    def __init__(self, *args, **kwargs):
        Includer.__init__(self, *args, **kwargs)
        self.tag_string = '<script type="text/javascript" src="{0}"></script>'

    def _compress(self):
        output = []

        for src in self.includes:
            with codecs.open(self._get_path(src), encoding='utf-8') as f:
                output.append(minify(f.read()))

        return '\n'.join(output)


class CSSIncluder(Includer):
    """
    Psuedo-template tag that handles collecting CSS and serving
    appropriate clean or compressed versions.
    """
    def __init__(self, *args, **kwargs):
        Includer.__init__(self, *args, **kwargs)
        self.tag_string = '<link rel="stylesheet" type="text/css" href="{0}" />'

    def _compress(self):
        output = []

        for src in self.includes:
            with codecs.open(self._get_path(src), encoding='utf-8') as f:
                output.append(cssmin(f.read()))

        return '\n'.join(output)


def format_currency(amount):
    if not amount:
        amount = '0'
    return '${:,.2f}'.format(int(amount))


def total_for_payments(payments, format=True):
    total = 0
    for payment in payments:
        if payment.payment:
            total += payment.payment
    if format:
        return format_currency(total)
    else:
        return total
