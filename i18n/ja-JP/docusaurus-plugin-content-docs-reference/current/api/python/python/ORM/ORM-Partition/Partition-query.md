---
title: "query() | Python | ORM"
slug: /python/python/Partition-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ブール式を使用してエンティティのスカラーフィールドに対してクエリを実行します。 | Python | ORM"
type: docx
token: N97pdfkjlo9j61xrtL2cbB79nKe
sidebar_position: 8
keywords: 
  - rag ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query()

この操作は、ブール式を使用してエンティティのスカラーフィールドに対してクエリを実行します。

## Request Syntax\{#request-syntax}

```python
query(
    expr: str, 
    output_fields: List[str] | None, 
    timeout: float | None,
    **kwargs
)
```

**PARAMETERS:**

- **expr** (*string*) -

    **[REQUIRED]** 

    エンティティのスカラーフィールドをフィルタリングするためのブール式です。

- **output_fields** (List[str] | *None*) -

    出力に含める必要があるフィールド名のリストです。これを **None** に設定すると、この操作はプライマリキーフィールドのみを出力することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかの応答が到着した時点、または何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **kwargs**: 

    追加のキーワード引数です。

    - **consistency_level** (*str* | *int*) -

        対象コレクションの整合性レベルです。

        値のデフォルトは、現在のコレクションの作成時に指定した値です。指定可能な値は **Strong**（**0**）、**Bounded**（**1**）、**Session**（**2**）、**Eventually**（**3**）です。

        <Admonition type="info" title="Note">

        整合性レベルとは何ですか？
        
                分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
        
                Zilliz Cloud は **Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトでは **Bounded Staleness** が設定されています。
        
                ベクトル類似検索やクエリを実行する際に整合性レベルを簡単に調整して、アプリケーションに最適な状態にできます。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        有効なタイムスタンプです。 

        このパラメータを設定した場合、このタイムスタンプより前に挿入されたすべてのエンティティがクエリノードから参照できるときにのみ、Zilliz Cloud はクエリを実行します。 

        <Admonition type="info" title="Notes">

        このパラメータは、デフォルトの整合性レベルが適用される場合に有効です。

        </Admonition>

    - **graceful_time** (*int*) -

        秒単位の期間です。

        デフォルト値は **5** です。このパラメータを設定した場合、Zilliz Cloud は現在のタイムスタンプからこの値を減算して保証タイムスタンプを計算します。

        <Admonition type="info" title="Notes">

        このパラメータは、デフォルト以外の整合性レベルが適用される場合に有効です。

        </Admonition>

    - **offset** (*int*) -

        クエリ結果内でスキップするレコード数です。 

        このパラメータを `limit` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。 

    - **limit** (*int*) -

        クエリ結果で返すレコード数です。

        このパラメータを `offset` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `offset` の合計は 16,384 未満である必要があります。 

**RETURN TYPE:**

*List*

**RETURNS:**

クエリ結果のリストです。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に発生します。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

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
partition = Partition(collection, name="test_collection")

# Insert a list of columns
res = partition.insert(
    data=[
        [0,1,2,3,4,5,6,7,8,9],               # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Query without any scalar filtering condition
# This query returns entities with their ids from 0 to 4.
res = partition.query(
    expr="",
    limit=5,
) 

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = partition.query(
    expr="",
    offset=5
    limit=5
)

# Query with a scalar filtering condition
res = partition.query(
    expr="id in [6,7,8]",
)

# Query with specified output fields
res = partition.query(
    expr="id in [6,7,8]",
    output_fields=["id", "vector"],
)

# Query with a customized consistency level
res = partition.query(
    expr="",
    consistency_level=3,
    graceful_time=6
)
```

## Related operations\{#related-operations}

以下の操作は `query()` に関連しています。

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

