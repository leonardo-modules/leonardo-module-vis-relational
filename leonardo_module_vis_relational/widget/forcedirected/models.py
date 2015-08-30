import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class ForceDirectedWidget(RelationalVisualizationWidget):
    """
    Force-directed graph widget.
    """

    class Meta:
        abstract = True
        verbose_name = _("Force-Directed Graph")
        verbose_name_plural = _("Force-Directed Graphs")
