import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class VoronoiTreemapWidget(RelationalVisualizationWidget):
    """
    Voronoi treemap widget.
    """
    polygon = models.CharField(verbose_name=_('Polygon'), default='rectangle', max_length=20)
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Voronoi Treemap")
        verbose_name_plural = _("Voronoi Treemaps")
