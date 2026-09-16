---
title: "create_index() | Python | ORM"
slug: /python/python/Collection-create_index
sidebar_label: "create_index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "対象フィールド（ベクトルフィールドまたはスカラーフィールド）の名前付きインデックスを作成します。 | Python | ORM"
type: docx
token: J76vdPHNgoyp2wxAiTcceIVJnOe
sidebar_position: 4
keywords: 
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - クラウド
  - create_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_index()

この操作は、対象フィールド（ベクトルフィールドまたはスカラーフィールド）に対して名前付きインデックスを作成します。

<Admonition type="info" title="Notes">

この操作はノンブロッキングです。現在のプロセスをブロックするには、`utility.wait_for_index_building_complete()` を呼び出します。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
create_index(
    field_name: str, 
    index_params: dict | None, 
    timeout: float | None
)
```

**パラメーター:**

- **field_name** (*string*) -

    インデックスを作成する対象のフィールドの名前です。

- **index_params** (*dict*) - 

    インデックス構築プロセスに適用されるパラメーターです。

    - **index_type** (string) -

        インデックスの構築に使用するアルゴリズムです。

        インデックスタイプには常に **AUTOINDEX** を使用してください。詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

    - **metric_type** (*string*) - 

        インデックスの構築に使用する類似度メトリックタイプです。

        指定できる値は **L2**、**IP**、**COSINE** です。詳細については、[Similarity Metrics Explained](/docs/search-metrics-explained) を参照してください。

    - **params** (*dict*) -

        選択したインデックスタイプに対応するインデックス構築パラメーターです。

        適用可能なインデックス構築パラメーターの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*Status*

**戻り値:**

この操作が成功したかどうかを示す **Status** オブジェクトです。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

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
```

## 関連する操作\{#related-operations}

以下の操作は `create_index()` に関連しています。

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [インデックス()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)
