import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class EdgeBundleWidget(RelationalVisualizationWidget):
    """
    Hiearchical Edge bundle widget.
    """
    tension = models.DecimalField(verbose_name=_('Tension'), default="0.86", max_digits=5, decimal_places=3)

    class Meta:
        abstract = True
        verbose_name = _("Hiearchical Edge Bundle")
        verbose_name_plural = _("Hiearchical Edge Bundles")
