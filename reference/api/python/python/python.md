---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Python SDK Reference

MilvusClient provides a simple and easy-to-use alternative to the legacy ORM approach. It adopts a purely functional approach to simplify interactions with the server. Each MilvusClient establishes a gRPC connection to the server you specified. To set up multiple connections, you can create multiple MilvusClient instances.

## Install & Update

You can run the following command in your terminal to install the latest PyMilvus or update your PyMilvus to this version.

```shell
pip install --upgrade pymilvus==v2.6.3
```

After the installation, you can check the pymilvus version by running the following

```python
from pymilvus import __version__

print(__version__)

# v2.6.3
```

## Connect to Cluster

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token
)
```

## What's New

In this version, PyMilvus adds a MilvusClient module that incorporates several functional methods, aligning its functionality overall with that of the legacy ORM module.

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Examples

In addition to the documents, you can also refer to [the example sets](https://github.com/milvus-io/pymilvus/tree/2.3/examples/milvus_client) in our GitHub repo.
