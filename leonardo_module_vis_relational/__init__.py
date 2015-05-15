
import logging

from django.apps import AppConfig

LOG = logging.getLogger(__name__)

from .widget import *

default_app_config = 'leonardo_module_vis_relational.NavConfig'


class Default(object):

    optgroup = ('Relational vis')

    @property
    def apps(self):

        return [

            'leonardo_module_vis_relational',

        ]

    @property
    def widgets(self):
        return [
        ]

class NavConfig(AppConfig, Default):

    name = 'leonardo_module_vis_relational'
    verbose_name = "Relational Visualization Module"


default = Default()
