---
title: "インデックス() | Python | ORM"
slug: /python/python/Collection-index
sidebar_label: "インデックス()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the specified インデックス of the current コレクション. | Python | ORM"
type: docx
token: RkQ8dnWDHo3DiDxiCVRcP1xPnob
sidebar_position: 18
keywords: 
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - インデックス()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# インデックス()

This operation gets the specified インデックス of the current コレクション.

## Request Syntax\{#request-syntax}

```python
index(
    **kwargs
)
```

**PARAMETERS:**

- **kwargs -** 

    追加のキーワード引数。

    - **index_name** (*str*) -

        The name of the インデックス. If no インデックス is specified, the default インデックス name is used.

        A default インデックス name is in the following format: `_default_idx_{field_id}`.

**RETURN TYPE:**

*インデックス*

**RETURNS:**

An インデックス object of the current コレクション.

**EXCEPTIONS:**

- **IndexNotExistException**

    This exception will be raised when the specified インデックス does not exist.

- **AmbiguousIndexName**

    This exception will be raised when multiple インデックス exist but no インデックス name has been specified. 

## Examples\{#examples}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="test_collection")

# Create an index on a scalar field
collection.create_index(
    field_name="id"
)

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Check the index
collection.has_index() # True

# list all index names
collection.indexes

# [<pymilvus.orm.index.Index at 0x12045f910>,
# <pymilvus.orm.index.Index at 0x12045d0d0>]

# Get a specific index object
collection.index(index_name="_default_idex_101")

# <pymilvus.orm.index.Index at 0x1205b8690>
```

## Related operations\{#related-operations}

以下の操作は `index()` に関連しています。

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

