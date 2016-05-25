
from django.conf.urls import patterns, url
from django.http import JsonResponse
from feincms.views.decorators import standalone
from leonardo.module.web.models import Page


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
                       url('^vis-relational-data/sitemap/$', site_map_json,
                           name='site_map_json'),
                       )
