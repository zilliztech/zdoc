---
title: "query() | Python | ORM"
slug: /python/python/Partition-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ブール式を使用して entity の scalar field に対するクエリを実行します。 | Python | ORM"
type: docx
token: N97pdfkjlo9j61xrtL2cbB79nKe
sidebar_position: 8
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query()

この操作は、ブール式を使用して entity の scalar field に対するクエリを実行します。

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

    entity の scalar field をフィルタリングするためのブール式です。

- **output_fields** (List[str] | *None*) -

    出力に含める必要がある field 名のリストです。これを **None** に設定すると、この操作は主キー field のみを出力します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs**: 

    追加のキーワード引数です。

    - **consistency_level** (*str* | *int*) -

        対象 collection の整合性レベルです。

        値のデフォルトは現在の collection 作成時に指定したものです。指定可能な値は **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) です。

        <Admonition type="info" icon="📘" title="Note">

        整合性レベルとは何ですか？
        
                分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
        
                Zilliz Cloud は 3 つの整合性レベル、**Strong**、**Bounded Staleness**、**Eventually** を提供しており、デフォルトは **Bounded Staleness** です。
        
                vector 類似検索やクエリを実行する際に整合性レベルを簡単に調整して、アプリケーションに最適なものにできます。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        有効なタイムスタンプです。 

        このパラメータが設定されている場合、Zilliz Cloud はこのタイムスタンプより前に挿入されたすべての entity が query node から見える場合にのみクエリを実行します。 

        <Admonition type="info" icon="📘" title="Notes">

        このパラメータは、デフォルトの整合性レベルが適用される場合に有効です。

        </Admonition>

    - **graceful_time** (*int*) -

        秒単位の期間です。

        デフォルト値は **5** です。このパラメータが設定されている場合、Zilliz Cloud は現在のタイムスタンプからこの値を差し引いて guarantee timestamp を計算します。

        <Admonition type="info" icon="📘" title="Notes">

        このパラメータは、デフォルト以外の整合性レベルが適用される場合に有効です。

        </Admonition>

    - **offset** (*int*) -

        クエリ結果でスキップするレコード数です。 

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

