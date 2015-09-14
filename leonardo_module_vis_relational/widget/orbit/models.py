import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _

from leonardo_module_vis_relational.models import RelationalVisualizationWidget

ORBIT_MODE_CHOICES = (
    ('flat', _('Flat')),
    ('solar', _('Solar')),
    ('atomic', _('Atomic')),
)

class OrbitWidget(RelationalVisualizationWidget):
    """
    Widget which shows orbital layout tree.
    """
    mode = models.CharField(verbose_name=_('Mode'), default='flat', max_length=20, choices=ORBIT_MODE_CHOICES)
    speed = models.IntegerField(verbose_name=_('Speed'), default=0)

    class Meta:
        abstract = True
        verbose_name = _("Orbital Layout")
        verbose_name_plural = _("Orbital Layouts")
