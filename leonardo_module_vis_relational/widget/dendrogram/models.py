import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class DendrogramWidget(RelationalVisualizationWidget):
    """
    Dendrogram widget.
    """
    collapse = models.BooleanField(verbose_name=_('Collapse'), default=False)
    orientation = models.CharField(verbose_name=_('Orientation'), default='left', max_length=20)

    class Meta:
        abstract = True
        verbose_name = _("Dendrogram")
        verbose_name_plural = _("Dendrograms")
