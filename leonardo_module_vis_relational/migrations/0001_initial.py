# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RelationalDataSource',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('type', models.CharField(default=b'neo4j', max_length=255, verbose_name='type', choices=[(b'dummy', 'Hierarchy: Sitemap'), (b'flare', 'Network: Flare'), (b'miserables', 'Network: Miserables'), (b'neo4j', 'Network: Neo4j'), (b'graphml', 'Network: GraphML'), (b'graphson', 'Network: GraphSON')])),
                ('name', models.CharField(max_length=255, verbose_name='name')),
                ('data', models.TextField(help_text='For neo4j set: host, port, ssl, graph, user, passwd; for graph files: url', verbose_name='data')),
            ],
            options={
                'verbose_name': 'Graph data source',
                'verbose_name_plural': 'graph data sources',
            },
        ),
    ]
