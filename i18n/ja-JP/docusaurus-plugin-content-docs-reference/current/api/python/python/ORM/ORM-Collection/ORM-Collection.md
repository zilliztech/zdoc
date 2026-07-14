---
title: "Collection | Python | ORM"
slug: /python/python/ORM-Collection
sidebar_label: "Collection"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Collection インスタンスは Milvus collection を表します。 | Python | ORM"
type: docx
token: OSehdj15Ao3AUvxOIJucXzU8nWW
sidebar_position: 1
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - Collection
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Collection

**Collection** インスタンスは、Milvus collection を表します。

```python
class pymilvus.Collection
```

## Constructor\{#constructor}

名前、schema、およびその他のパラメータを指定して collection を構築します。

```python
Collection(
    name: str,
    schema: CollectionSchema,
    using: str
) 
```

**PARAMETERS:**

- **name** (*string*) - 

    **[REQUIRED]**

    作成する collection の名前。

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) - 

    collection の作成に使用する schema。 

    デフォルト値は **None** で、デフォルトの schema が使用されることを示します。

    <Admonition type="info" icon="📘" title="Note">

    schema とは何ですか？
    
        schema は、対象の collection 内でデータを整理する役割を担います。有効な schema には複数の field が含まれている必要があり、その中には primary key、vector field、およびいくつかの scalar field が含まれていなければなりません。

    </Admonition>

- **using** (*string*) - 

    使用する connection のエイリアス。

    デフォルト値は **default** で、この操作がデフォルトの connection を使用することを示します。

- **num_shards** (*int*) -

    この collection の作成時にあわせて作成する shard の数。 

    デフォルト値は **1** で、この collection とともに 1 つの shard が作成されることを示します。

    <Admonition type="info" icon="📘" title="Note">

    sharding とは何ですか？
    
        sharding とは、書き込み操作を異なるノードに分散し、データ書き込みにおいて Milvus cluster の並列計算能力を最大限に活用することを指します。
    
        デフォルトでは、1 つの collection には 1 つの shard が含まれます。

    </Admonition>

- **consistency_level** (*int* | *str*)

    対象 collection の整合性レベル。

    デフォルト値は **Bounded** (**1**) で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) を選択できます。

    <Admonition type="info" icon="📘" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        vector 類似検索やクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**RETURN TYPE:**

*Collection*

**RETURNS:**

collection オブジェクト。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    提供された schema が無効な場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

# Create a collection using the user-defined schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

schema = CollectionSchema(
    fields = [primary_key, vector]
)

collection = Collection(
    name="test_01",
    schema=schema,
    using="default"
)
```

## Members\{#members}

以下は `Collection` クラスのメンバーです:

