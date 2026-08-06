---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';

# Python SDK Reference

[PyMilvus](https://github.com/milvus-io/pymilvus) is the Python SDK for Zilliz Cloud. Use `MilvusClient` to connect to a cluster, manage collections and indexes, write data, and run vector searches. The package also provides `AsyncMilvusClient` for asynchronous applications and optional utilities for bulk-data preparation, embeddings, and reranking.

## Features

- **Synchronous and asynchronous clients** — Use `MilvusClient` in synchronous code or `AsyncMilvusClient` with Python async frameworks.
- **Collection and index management** — Define schemas, create collections and indexes, and control collection loading.
- **Data and vector operations** — Insert, upsert, delete, query, search, and run hybrid searches through Python APIs.
- **Cloud administration** — Work with databases, partitions, users, roles, and resource groups available to your cluster.
- **Optional tooling** — Install the `bulk_writer` extra for bulk-data files or the `model` extra for embedding and reranking integrations.

## Installation

Install or upgrade the core SDK from PyPI:

```bash
python -m pip install --upgrade pymilvus
```

Install optional integrations only when your application needs them:

```bash
python -m pip install "pymilvus[bulk_writer]"
python -m pip install "pymilvus[model]"
```

## Connect to Zilliz Cloud

Copy the public endpoint from the cluster **Connect** card and use an API key or cluster credential as the token.

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)

try:
    print(client.list_collections())
finally:
    client.close()
```

## Resources

- [PyMilvus source repository](https://github.com/milvus-io/pymilvus)
- [PyMilvus examples](https://github.com/milvus-io/pymilvus/tree/master/examples)
- [PyMilvus releases](https://github.com/milvus-io/pymilvus/releases)

import DocCardList from '@theme/DocCardList';

<DocCardList />
