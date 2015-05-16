import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo.module.web.models import Widget
from leonardo_module_vis_relational.models import RelationalDataSource

class BubbleChartWidget(Widget):
    """
    Widget which shows bubble chart.
    """
    data = models.ForeignKey(RelationalDataSource, verbose_name=_('data source'), blank=True, null=True) 
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Bubble chart")
        verbose_name_plural = _("Bubble charts")
