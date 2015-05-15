import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import GraphDrawingWidget

class SunburstWidget(GraphDrawingWidget):
    """
    Widget which shows sunburt diagram.
    """
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Sunburst")
        verbose_name_plural = _("Sunbursts")
