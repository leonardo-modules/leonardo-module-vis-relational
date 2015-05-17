import datetime
import time

from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo.module.web.models import Widget
from leonardo_module_vis_relational.models import RelationalDataSource

class TreemapWidget(Widget):
    """
    Widget which shows treemap.
    """
    data = models.ForeignKey(RelationalDataSource, verbose_name=_('data source'), blank=True, null=True) 
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    def get_data(self):
        return "/sitemap/json/"

    class Meta:
        abstract = True
        verbose_name = _("Treemap")
        verbose_name_plural = _("Treemaps")
