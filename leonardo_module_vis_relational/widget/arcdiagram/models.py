import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class ArcDiagramWidget(RelationalVisualizationWidget):
    """
    Arc diagram widget.
    """
    orientation = models.CharField(verbose_name=_('Orientation'), default='bottom', max_length=20)

    class Meta:
        abstract = True
        verbose_name = _("Arc Diagram")
        verbose_name_plural = _("Arc Diagrams")
