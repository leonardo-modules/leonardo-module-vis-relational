
from django.contrib import admin

from django.utils.translation import ugettext_lazy as _

from models import RelationalDataSource

class RelationalDataSourceAdmin(admin.ModelAdmin):
    pass

admin.site.register(RelationalDataSource, RelationalDataSourceAdmin)
