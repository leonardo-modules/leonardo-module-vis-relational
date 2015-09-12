
from django.conf import settings
from django.conf.urls import include, patterns, url
from django.conf.urls.static import static
from leonardo.site import leonardo_admin
from django.contrib.sitemaps.views import sitemap
from django.views.generic.base import RedirectView, TemplateView
from feincms.module.page.sitemap import PageSitemap
from django.utils.module_loading import module_has_submodule  # noqa
from django.utils.importlib import import_module  # noqa

from feincms.views.decorators import standalone
from leonardo.module.web.models import Page

from django.http import HttpResponse

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser


class JsonResponse(HttpResponse):
    """
    An HttpResponse that renders it's content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JsonResponse, self).__init__(content, **kwargs)

def _get_page_dict(page):
    output = {
        'name': page.title,
    }
    if page.children.count() == 0:
        lst = []
#        for content in page.content.col3:
#            lst.append(content)
        output['size'] = len(lst) + 1
    else:
        output['children'] = []
        for subpage in page.children.all():
            if subpage.in_navigation:
                output['children'].append(_get_page_dict(subpage))
    return output

@standalone
def site_map_json(request):
    root = {
        'name': 'root',
        'children': []
    }
    page_list = Page.objects.filter(level=0, active=True)
    for page in page_list:
        root['children'].append(_get_page_dict(page))
        break
    return JsonResponse(root['children'][0])

urlpatterns = patterns('',
    url('^sitemap/json/$', site_map_json, name='site_map_json'),
)
