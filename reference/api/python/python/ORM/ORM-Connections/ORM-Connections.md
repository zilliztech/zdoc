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
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - Connections
  - pymilvus30
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

Instead of creating a new instance of this class on your own, import the existing singleton instance as shown in the following example.

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

<Admonition type="info" icon="📘" title="Note">

How can I get the cluster endpoint and token?

- **Cluster endpoint**

    You can log into the [Zilliz Cloud](https://cloud.zilliz.com) console and click **Clusters** in the left navigation pane. In the cluster list, click the name of the target cluster and copy its endpoint in the **Connect** area.

- **Access token**

    To connect to a Zilliz Cloud cluster, you can use either of the following

    - An API key

        You can log into the [Zilliz Cloud](https://cloud.zilliz.com) console and click **API Keys** in the left navigation pane.

    - A pair of username and password to access the cluster, joined by a colon (**:**).

        You can use the cluster credentials specified when the cluster has been created on the Zilliz Cloud console, or those of any existing cluster users.

</Admonition>

## Methods\{#methods}

The following are the methods of the `connections` singleton instance: