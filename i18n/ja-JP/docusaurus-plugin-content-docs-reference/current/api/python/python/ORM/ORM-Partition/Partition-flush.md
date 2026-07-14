---
title: "flush() | Python | ORM"
slug: /python/python/Partition-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、partition 内のすべての segment を seal します。この操作後の挿入は、新しい segment を生成します。 | Python | ORM"
type: docx
token: VRGwdg75Ao7ZXQx7uANc9wzXnVb
sidebar_position: 3
keywords: 
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルDB比較
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

この操作は、partition 内のすべての segment を seal します。この操作後の挿入は、新しい segment を生成します。

## Request Syntax\{#request-syntax}

```python
flush(
    timeout: float | None
)   
```

<Admonition type="info" icon="📘" title="注記">

データを挿入するたびに `flush()` を呼び出してもよいですか？

新しいデータが挿入されると、それは growing segment に書き込まれます。growing segment のサイズが上限に達すると、Zilliz Cloud は自動的にその segment を seal します。 

この操作を継続的に呼び出すと、小さなサイズの seal 済み segment が多数作成され、検索性能が徐々に低下する可能性があります。 

検索を実行する前に、Zilliz Cloud がすべての segment を seal するのを待つことを推奨します。

</Admonition>

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

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

# Create a partition
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Insert a list of columns
partition.insert(
    data=[
        [0,1,2,3,4],                         # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Flush the data 
partition.flush()

# Check the number of flushed entities in the partition 
partition.num_entities # 5
```

## 関連操作\{#related-operations}

`flush()` に関連する操作は次のとおりです。

- [delete()](./Partition-delete)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

