---
title: "index() | Python | ORM"
slug: /python/python/Collection-index
sidebar_label: "index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の collection の指定された index を取得します。 | Python | ORM"
type: docx
token: RkQ8dnWDHo3DiDxiCVRcP1xPnob
sidebar_position: 18
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# index()

この操作は、現在の collection の指定された index を取得します。

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

        index の名前です。index が指定されていない場合は、デフォルトの index 名が使用されます。

        デフォルトの index 名は、次の形式です: `_default_idx_{field_id}`。

**RETURN TYPE:**

*Index*

**RETURNS:**

現在の collection の Index オブジェクト。

**EXCEPTIONS:**

- **IndexNotExistException**

    指定された index が存在しない場合に、この例外が発生します。

- **AmbiguousIndexName**

    複数の index が存在するにもかかわらず、index 名が指定されていない場合に、この例外が発生します。 

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

