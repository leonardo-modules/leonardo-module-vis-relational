import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo.module.web.models import Widget
from leonardo_module_vis_relational.models import RelationalDataSource

class DendrogramWidget(Widget):
    """
    Widget which shows dendrogram.
    """
    data = models.ForeignKey(RelationalDataSource, verbose_name=_('data source'), blank=True, null=True) 
    collapse = models.BooleanField(verbose_name=_('Collapse'), default=False)
    orientation = models.CharField(verbose_name=_('Orientation'), default='left', max_length=20)

    def get_data(self):
        return "/sitemap/json/"

    class Meta:
        abstract = True
        verbose_name = _("Dendrogram")
        verbose_name_plural = _("Dendrograms")
