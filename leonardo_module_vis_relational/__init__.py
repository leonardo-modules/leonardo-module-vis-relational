
import logging

from django.apps import AppConfig

LOG = logging.getLogger(__name__)

from .widget import *

default_app_config = 'leonardo_module_vis_temporal.NavConfig'


class Default(object):

    optgroup = ('Temporal vis')

    @property
    def apps(self):

        return [

            'leonardo_module_vis_temporal',

        ]

    @property
    def widgets(self):
        return [
            PolarClockWidget,
        ]

class NavConfig(AppConfig, Default):

    name = 'leonardo_module_vis_temporal'
    verbose_name = "Temporal Visualizations Module"


default = Default()
