---
title: "prepare_index_params() | Python | MilvusClient"
slug: /python/python/Management-prepare_index_params
sidebar_label: "prepare_index_params()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation prepares index parameters to build indexes for a specific collection. | Python | MilvusClient"
type: docx
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 11
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - prepare_index_params()
  - pymilvus26
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# prepare_index_params()

This operation prepares index parameters to build indexes for a specific collection.

<Admonition type="info" icon="📘" title="Notes">

<p>This is a class method. You should call this method like this: <code>MilvusClient.prepare_index_params()</code>.</p>

</Admonition>

## Request syntax\{#request-syntax}

```python
pymilvus.MilvusClient.prepare_index_params() -> IndexParams
```

**PARAMETERS:**

N/A

**RETURN TYPE:**

*IndexParams*

**RETURNS:**

An **IndexParams** contains a list of **IndexParam** objects.

- **IndexParams**

    A list of **IndexParam** objects.

    ```python
    ├── IndexParams 
    │       └── add_index()
    ```

    It offers the **[add_index()](./Management-add_index)** method to add indexes to the list.

**EXCEPTIONS:**

None

## Examples\{#examples}

```python
from pymilvus import MilvusClient

index_params = MilvusClient.prepare_index_params()
```

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

