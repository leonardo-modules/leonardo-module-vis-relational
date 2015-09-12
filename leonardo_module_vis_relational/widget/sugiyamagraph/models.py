import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class SugiyamaGraphWidget(RelationalVisualizationWidget):
    """
    Widget which shows Sugiyama layered graph.
    """

    class Meta:
        abstract = True
        verbose_name = _("Sugiyama Graph")
        verbose_name_plural = _("Sugiyama Graphs")
