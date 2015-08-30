
import logging

from django.apps import AppConfig

LOG = logging.getLogger(__name__)

from .widget import *

default_app_config = 'leonardo_module_vis_relational.NavConfig'

class Default(object):

    optgroup = ('Relational visualizations')

    js_files = [
        'vendor/js/d3.layout.orbit.js',
        'vendor/js/d3.layout.voronoitreemap.js',
        'vis/js/arcdiagram.js',
        'vis/js/bubblechart.js',
        'vis/js/circlepacking.js',
        'vis/js/dendrogramlinear.js',
        'vis/js/dendrogramradial.js',
        'vis/js/icicle.js',
        'vis/js/indentedtree.js',
        'vis/js/orbit.js',
        'vis/js/sunburst.js',
        'vis/js/reingoldtilfordtreeradial.js',
        'vis/js/reingoldtilfordtreelinear.js',
        'vis/js/treemap.js',
        'vis/js/voronoitreemap.js'
    ]

    scss_files = [
        'vis/scss/bubblechart.scss',
        'vis/scss/circlepacking.scss',
        'vis/scss/dendrogram.scss',
        'vis/scss/icicle.scss',
        'vis/scss/indentedtree.scss',
        'vis/scss/orbit.scss',
        'vis/scss/reingoldtilfordtree.scss',
        'vis/scss/sunburst.scss',
        'vis/scss/treemap.scss'
    ]

    @property
    def apps(self):

        return [
            'leonardo_module_vis_relational',
        ]

    @property
    def widgets(self):
        return [
            ArcDiagramWidget,
            BubbleChartWidget,
            CirclePackingWidget,
            DendrogramWidget,
            IcicleWidget,
            IndentedTreeWidget,
            OrbitWidget,
            ReingoldTilfordTreeWidget,
            SunburstWidget,
            TreemapWidget,
            VoronoiTreemapWidget
        ]

class NavConfig(AppConfig, Default):

    name = 'leonardo_module_vis_relational'
    verbose_name = "Relational Visualization Module"


default = Default()
