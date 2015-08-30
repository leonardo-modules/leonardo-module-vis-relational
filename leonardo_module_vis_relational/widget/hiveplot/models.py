import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

class HivePlotWidget(RelationalVisualizationWidget):
    """
    Widget which shows hive plot
    """

    class Meta:
        abstract = True
        verbose_name = _("Hive Plot")
        verbose_name_plural = _("Hive Plots")
