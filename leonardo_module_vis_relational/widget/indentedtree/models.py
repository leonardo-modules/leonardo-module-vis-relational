import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class IndentedTreeWidget(RelationalVisualizationWidget):
    """
    Widget which shows indented tree.
    """
    zoom = models.BooleanField(verbose_name=_('Zoom'), default=False)

    class Meta:
        abstract = True
        verbose_name = _("Indented Tree")
        verbose_name_plural = _("Indented Trees")
