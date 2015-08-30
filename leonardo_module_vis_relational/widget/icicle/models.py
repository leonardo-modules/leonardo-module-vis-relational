import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class IcicleWidget(RelationalVisualizationWidget):
    """
    Widget which shows icicle.
    """
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    def get_data(self):
        return "/sitemap/json/"

    class Meta:
        abstract = True
        verbose_name = _("Icicle")
        verbose_name_plural = _("Icicles")
