---
title: "create_index() | Python | ORM"
slug: /python/python/Collection-create_index
sidebar_label: "create_index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "これは、ベクトルフィールドまたはスカラーフィールドのいずれかである対象フィールドに対して、名前付きインデックスを作成します。 | Python | ORM"
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

これは、ベクトルフィールドまたはスカラーフィールドのいずれかである対象フィールドに対して、名前付きインデックスを作成します。

<Admonition type="info" icon="📘" title="Notes">

この操作はノンブロッキングです。現在のプロセスをブロックするには、`utility.wait_for_index_building_complete()` を呼び出せます。

</Admonition>

## Request Syntax\{#request-syntax}

```python
create_index(
    field_name: str, 
    index_params: dict | None, 
    timeout: float | None
)
```

**PARAMETERS:**

- **field_name** (*string*) -

    インデックスを作成するフィールドの名前です。

- **index_params** (*dict*) - 

    インデックス構築プロセスに適用されるパラメータです。

    - **index_type** (string) -

        インデックスの構築に使用されるアルゴリズムです。

        インデックスタイプとしては常に **AUTOINDEX** を使用してください。詳細は [AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

    - **metric_type** (*string*) - 

        インデックスの構築に使用される類似度メトリックのタイプです。

        使用可能な値は **L2**、**IP**、および **COSINE** です。詳細は [Similarity Metrics Explained](/docs/search-metrics-explained) を参照してください。

    - **params** (*dict*) -

        選択したインデックスタイプに対応するインデックス構築パラメータです。

        適用可能なインデックス構築パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着するか、エラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*Status*

**RETURNS:**

この操作が成功したかどうかを示す **Status** オブジェクト。

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

## Related operations\{#related-operations}

以下の操作は `create_index()` に関連しています。

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

