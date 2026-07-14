---
title: "set_properties() | Python | ORM"
slug: /python/python/Collection-set_properties
sidebar_label: "set_properties()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection のプロパティを設定します。 | Python | ORM"
type: docx
token: ECmAdaYKboPTNlxqkLxcUEZ4nrh
sidebar_position: 27
keywords: 
  - rag vector database
  - vector db とは
  - vector databases とは何か
  - vector databases の比較
  - zilliz
  - zilliz cloud
  - cloud
  - set_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# set_properties()

この操作は collection のプロパティを設定します。

## Request Syntax\{#request-syntax}

```python
set_properties(
    properties: dict, 
    timeout: float | None, 
    kwargs
)
```

**PARAMETERS:**

- **properties** (dict) -

    辞書形式の collection プロパティのセットです。現在、以下のプロパティを設定できます。

    - **collection.ttl.seconds**

        このプロパティを設定すると、現在の collection 内のデータは指定された時間で期限切れになります。期限切れのデータは collection からクリーンアップされ、search や query には使用されません。

    - **mmap.enabled**

        collection レベルでメモリマップドストレージを有効にするかどうか。詳細については、[メモリマッピングの設定](https://milvus.io/docs/mmap.md#Configure-memory-mapping) を参照してください。

- **timeout** (*float*)  -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

## Examples\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Set the TTL for the data in the collection
collection.set_properties(
    properties={
        "collection.ttl.seconds": 60
    }
)
```

## Related operations\{#related-operations}

以下の操作は `insert()` に関連しています。

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)

