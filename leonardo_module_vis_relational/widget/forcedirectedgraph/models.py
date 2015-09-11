import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class ForceDirectedGraphWidget(RelationalVisualizationWidget):
    """
    Force-directed graph widget.
    """

    gravity = models.DecimalField(verbose_name=_('gravity'), default=.05, max_digits=6, decimal_places=2)
    distance = models.IntegerField(verbose_name=_('distance'), default=100)
    charge = models.IntegerField(verbose_name=_('charge'), default=-100)

    class Meta:
        abstract = True
        verbose_name = _("Force-Directed Graph")
        verbose_name_plural = _("Force-Directed Graphs")
