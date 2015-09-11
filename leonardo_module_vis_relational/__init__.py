
from django.utils.translation import ugettext_lazy as _

from django.apps import AppConfig

from .widget import *

default_app_config = 'leonardo_module_vis_relational.Config'

LEONARDO_OPTGROUP = 'Relational Visualizations'

LEONARDO_JS_FILES = [
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

LEONARDO_SCSS_FILES = [
    'vis/scss/arcdiagram.scss',
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

LEONARDO_APPS = [
    'leonardo_module_vis_relational',
]

LEONARDO_WIDGETS = [
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

class Config(AppConfig):

    name = 'leonardo_module_vis_relational'
    verbose_name = _(LEONARDO_OPTGROUP)
