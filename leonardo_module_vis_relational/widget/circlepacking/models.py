import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class CirclePackingWidget(RelationalVisualizationWidget):
    """
    Circle packing widget.
    """
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Circle Packing")
        verbose_name_plural = _("Circle Packings")
