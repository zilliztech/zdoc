---
title: "query() | Python | ORM"
slug: /python/python/Collection-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたブール式を使用して scalar フィルタリングを実行します。 | Python | ORM"
type: docx
token: JzcYdBQ5zoU4KpxPqUHcPLQonKd
sidebar_position: 22
keywords: 
  - NLP
  - ニューラルネットワーク
  - 深層学習
  - ナレッジベース
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

この操作は、指定されたブール式を使用して scalar フィルタリングを実行します。

## Request Syntax\{#request-syntax}

```python
query(
    expr: str, 
    output_fields: list[str] | None, 
    partition_names: list[str] | None, 
    timeout: float | None
    **kwargs
)
```

**PARAMETERS:**

- **expr** (*str*) -

    **[REQUIRED]**

    一致するエンティティをフィルタリングするための scalar フィルタリング条件です。 

    scalar フィルタリングをスキップするには、このパラメータを空文字列に設定できます。この場合、返されるエンティティ数を制限するために `limit` も設定する必要があります。

    scalar フィルタリング条件の構築方法については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

- **output_fields** (*list*) -

    返される各エンティティに含めるフィールド名のリストです。

    デフォルト値は **None** です。指定しない場合、primary field のみが含まれます。

- **partition_names** (*list*)

    partition 名のリストです。

    デフォルト値は **None** です。指定した場合、指定された partition のみがクエリに使用されます。

- **timeout** (*float*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が返るかエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs**: 

    - **consistency_level** (*str* | *int*) -

        対象 collection の整合性レベルです。

        デフォルト値は現在の collection 作成時に指定した値で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) から選択できます。

        <Admonition type="info" icon="📘" title="Note">

        整合性レベルとは何ですか？
        
                分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
        
                Zilliz Cloud は 3 つの整合性レベル、**Strong**、**Bounded Staleness**、**Eventually** を提供しており、デフォルトは **Bounded Staleness** です。
        
                vector 類似度検索や query を実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        有効なタイムスタンプです。 

        このパラメータが設定されている場合、この timestamp より前に挿入されたすべてのエンティティが query ノードから見える場合にのみ query を実行します。 

        <Admonition type="info" icon="📘" title="Notes">

        このパラメータは、デフォルトの整合性レベルが適用される場合に有効です。

        </Admonition>

    - **graceful_time** (*int*) -

        秒単位の期間です。

        デフォルト値は **5** です。このパラメータが設定されている場合、現在の timestamp からこの値を差し引いて guarantee timestamp を計算します。

        <Admonition type="info" icon="📘" title="Notes">

        このパラメータは、デフォルト以外の整合性レベルが適用される場合に有効です。

        </Admonition>

    - **offset** (*int*) -

        query 結果内でスキップするレコード数です。 

        このパラメータを `limit` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。 

    - **limit** (*int*) -

        query 結果で返すレコード数です。

        このパラメータを `offset` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `offset` の合計は 16,384 未満である必要があります。 

**RETURN TYPE:**

*list[dict]*

**RETURNS:**

各辞書が query されたエンティティを表す辞書のリストです。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **DataTypeNotMatchException**

    パラメータ値が必要なデータ型に一致しない場合に、この例外が発生します。

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

# Insert a list of columns
res = collection.insert(
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
res = collection.query(
    expr="",
    limit=5,
) 

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = collection.query(
    expr="",
    offset=5
    limit=5
)

# Query with a scalar filtering condition
res = collection.query(
    expr="id in [6,7,8]",
)

# Query within a partition
res = collection.query(
    expr="id in [6,7,8]",
    partition_names=["partitionA"],
)

# Query with specified output fields
res = collection.query(
    expr="id in [6,7,8]",
    output_fields=["id", "vector"],
)

# Query with a customized consistency level
res = collection.query(
    expr="",
    consistency_level=3,
    graceful_time=6
)
```

## Related operations\{#related-operations}

以下の操作は `query()` に関連しています。

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

