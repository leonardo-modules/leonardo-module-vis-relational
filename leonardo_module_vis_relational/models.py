# -*- coding: utf-8 -*-

from django.db import models
from django.utils.translation import ugettext_lazy as _
from leonardo.module.web.models import Widget

SOURCE_TYPES = (
    ('dummy', _('Hierarchy: Sitemap')),
    ('flare', _('Network: Flare')),
    ('miserables', _('Network: Miserables')),
    ('neo4j', _('Network: Neo4j')),
    ('graphml', _('Network: GraphML')),
    ('graphson', _('Network: GraphSON')),
)

TEST_NODES = [
    {
        'id': 1,
        'text': "apple",
        'size': 9,
        'cluster': 5
    },
    {
        'id': 2,
        'text': "google",
        'size': 7,
        'cluster': 2
    },
    {
        'id': 3,
        'text': "m.soft",
        'size': 5,
        'cluster': 1
    },
    {
        'id': 4,
        'text': "java",
        'size': 9,
        'cluster': 3
    },
    {
        'id': 5,
        'text': "php",
        'size': 9,
        'cluster': 2
    }
]

TEST_LINKS = [
    [1, 2],
    [1, 5],
    [5, 1],
    [1, 4],
    [2, 3],
    [1, 3],
    [3, 4],
    [4, 5],
    [4, 1],
    [5, 2]
]


class RelationalDataSource(models.Model):
    type = models.CharField(max_length=255, verbose_name=_(
        "type"), default='neo4j', choices=SOURCE_TYPES)
    name = models.CharField(max_length=255, verbose_name=_("name"))
    #data = YAMLField(verbose_name=_("data"), help_text=_('For neo4j set: host, port, ssl, graph, user, passwd; for graph files: url'))
    data = models.TextField(verbose_name=_("data"), help_text=_(
        'For neo4j set: host, port, ssl, graph, user, passwd; for graph files: url'))

    def __unicode__(self):
        return self.name

    def get_dummy_data(self):
        return {
            'nodes': TEST_NODES,
            'links': TEST_LINKS
        }

    def _server_url(self):
        if self.data['ssl']:
            prefix = 'https'
        else:
            prefix = 'http'
        url = '%s://%s:%s/%s' % (prefix,
                                 self.data['host'], self.data['port'], self.data['graph'])
        return url
    server_url = property(_server_url)

    def get_graph_data(self, nodes=None, edges=None, systems=None):
        config = Config(self.server_url)
        g = Graph(config)
        data = {
            'nodes': [],
            'links': [],
        }
        for node in g.V:
            if node.eid != 0:
                if node.data()['element_type'] in nodes:
                    data['nodes'].append({
                        'name': node.data()['label'],
                        'group': 1,
                        'type': node.data()['element_type'],
                        'id': node.eid
                    })
        for edge in g.E:
            if edge.label() in edges and edge.inV().data()['element_type'] in nodes and edge.outV().data()['element_type'] in nodes:
                data['links'].append({
                    'source': edge.inV().eid,
                    'target': edge.outV().eid,
                    'type': edge.label(),
                    'weight': 1,
                    'value': 1,
                })
        return data

    def get_graph_data_tree(self, nodes=None, edges=None, systems=None):
        config = Config(self.server_url)
        g = Graph(config)
        data = {}
        for node in g.V:
            if node.eid != 0:
                if node.data()['element_type'] in nodes:
                    data[node.eid] = {
                        'name': node.data()['structured_label'],
                        'group': 1,
                        'size': 1,
                        #                        'type': node.data()['element_type'],
                        'id': node.eid,
                        'edges': []
                    }
        for edge in g.E:
            if edge.label() in edges and edge.inV().data()['element_type'] in nodes and edge.outV().data()['element_type'] in nodes:
                data[edge.inV().eid]['edges'].append(
                    edge.outV().data()['structured_label'])
        output = []
        for key, item in data.items():
            output.append(item)
        return output

    class Meta:
        verbose_name = _("Graph data source")
        verbose_name_plural = _("graph data sources")


class RelationalVisualizationWidget(Widget):
    """
    Graph widget mixin.
    """
    data = models.ForeignKey(RelationalDataSource, verbose_name=_(
        'Data source'), blank=True, null=True)

    def get_data(self):

        if self.data.type == 'flare':
            return "/static/vis/json/flare.json"
        elif self.data.type == 'miserables':
            return "/static/vis/json/miserables.json"
        else:
            return "/vis-relational-data/sitemap/"

    class Meta:
        abstract = True
