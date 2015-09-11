import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class AdjacencyMatrixWidget(RelationalVisualizationWidget):
    """
    Adjacency matrix widget.
    """

    class Meta:
        abstract = True
        verbose_name = _("Adjacency Matrix")
        verbose_name_plural = _("Adjacency Matrices")
