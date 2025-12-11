---
title: "Connections | Python | ORM"
slug: /python/python/ORM-Connections
sidebar_label: "Connections"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "A Connections instance represents a pool of connections to your Zilliz Cloud clusters. | Python | ORM"
type: docx
token: A96udk9seoF5x5xywQZcLasanIe
sidebar_position: 3
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - Connections
  - pymilvus26
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Connections

A **Connections** instance represents a pool of connections to your Zilliz Cloud clusters.

```python
class pymilvus.Connections
```

## Constructor\{#constructor}

Constructs a singleton instance to manage all connections. 

<Admonition type="info" icon="📘" title="Notes">

<p>Instead of creating a new instance of this class on your own, import the existing singleton instance as shown in the following example.</p>

</Admonition>

## Examples\{#examples}

```python
from pymilvus import connections    

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_TOKEN"

# Establish a connection
connections.connect(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
) 
```

<Admonition type="info" icon="📘" title="How can I get the cluster endpoint and token?">

<ul>
<li><strong>Cluster endpoint</strong></li>
</ul>
<p>You can log into the <a href="https://cloud.zilliz.com">Zilliz Cloud</a> console and click <strong>Clusters</strong> in the left navigation pane. In the cluster list, click the name of the target cluster and copy its endpoint in the <strong>Connect</strong> area.</p>
<ul>
<li><strong>Access token</strong></li>
</ul>
<p>To connect to a Zilliz Cloud cluster, you can use either of the following</p>
<ul>
<li>An API key</li>
</ul>
<p>You can log into the <a href="https://cloud.zilliz.com">Zilliz Cloud</a> console and click <strong>API Keys</strong> in the left navigation pane.</p>
<ul>
<li>A pair of username and password to access the cluster, joined by a colon (<strong>:</strong>).</li>
</ul>
<p>You can use the cluster credentials specified when the cluster has been created on the Zilliz Cloud console, or those of any existing cluster users.</p>

</Admonition>

## Methods\{#methods}

The following are the methods of the `connections` singleton instance: