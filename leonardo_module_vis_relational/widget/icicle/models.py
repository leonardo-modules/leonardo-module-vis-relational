import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class IcicleWidget(RelationalVisualizationWidget):
    """
    Widget which shows icicle.
    """
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Icicle Diagram")
        verbose_name_plural = _("Icicle Diagrams")
