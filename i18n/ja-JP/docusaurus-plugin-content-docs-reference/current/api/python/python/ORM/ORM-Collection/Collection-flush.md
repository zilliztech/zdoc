---
title: "flush() | Python | ORM"
slug: /python/python/Collection-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクション内のすべてのセグメントをシールします。この操作以降の挿入は、新しいセグメントを生成します。 | Python | ORM"
type: docx
token: VdiwdqQ9iofbkoxcc8Kcqk5gnhZ
sidebar_position: 11
keywords: 
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - flush()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

この操作は、コレクション内のすべてのセグメントをシールします。この操作以降の挿入は、新しいセグメントを生成します。

## リクエスト構文\{#request-syntax}

```python
flush(
    timeout: float | None
)   
```

<Admonition type="info" title="Note">

データを挿入するたびに flush() を呼び出すことはできますか？

新しいデータが挿入されると、そのデータは growing segment に書き込まれます。growing segment のサイズが上限に達すると、Zilliz Cloud は自動的にそのセグメントをシールします。

この操作を継続的に呼び出すと、サイズの小さいシール済みセグメントが多数生成され、検索パフォーマンスが徐々に低下する可能性があります。

検索を実行する前に、Zilliz Cloud がすべてのセグメントをシールするのを待つことを推奨します。

</Admonition>

**パラメーター:**

- **パラメーター:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

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

# Insert some data
collection.insert(
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
collection.flush()

# Check the number of flushed entities in the collection 
collection.num_entities # 5
```

## 関連する操作\{#related-operations}

以下の操作は `flush()` に関連しています。

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [get_replicas()](./Collection-get_replicas)

- [set_properties()](./Collection-set_properties)

