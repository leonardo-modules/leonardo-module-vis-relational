import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class TreemapWidget(RelationalVisualizationWidget):
    """
    Widget which shows treemap.
    """
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Treemap")
        verbose_name_plural = _("Treemaps")
