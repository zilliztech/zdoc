---
title: "コレクション | Python | ORM"
slug: /python/python/ORM-Collection
sidebar_label: "コレクション"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションインスタンスは、Milvus のコレクションを表します。 | Python | ORM"
type: docx
token: OSehdj15Ao3AUvxOIJucXzU8nWW
sidebar_position: 1
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - cloud
  - コレクション
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# コレクション

**コレクション**インスタンスは、Milvus のコレクションを表します。

```python
class pymilvus.Collection
```

## コンストラクター\{#constructor}

名前、スキーマ、およびその他のパラメータを指定してコレクションを構築します。

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

    作成するコレクションの名前です。

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) - 

    コレクションの作成に使用するスキーマです。 

    デフォルト値は **None** で、デフォルトのスキーマが使用されることを示します。

    <Admonition type="info" title="Note">

    スキーマとは何ですか？
    
        スキーマは、対象のコレクション内でデータを整理する役割を担います。有効なスキーマには複数のフィールドが必要であり、スキーマにはプライマリキー、ベクトルフィールド、およびいくつかのスカラーフィールドを含める必要があります。

    </Admonition>

- **using** (*string*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルトの接続を使用することを示します。

- **num_shards** (*int*) -

    このコレクションの作成時にあわせて作成するシャードの数です。 

    デフォルト値は **1** で、このコレクションとともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" title="Note">

    シャーディングとは何ですか？
    
        シャーディングとは、書き込み操作を異なるノードに分散し、データの書き込みにおいて Milvus クラスターの並列計算能力を最大限に活用することを指します。
    
        デフォルトでは、1 つのコレクションに 1 つのシャードが含まれます。

    </Admonition>

- **consistency_level** (*int* | *str*)

    対象のコレクションの整合性レベルです。

    デフォルト値は **Bounded** (**1**) で、対象のコレクションでは **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) を選択できます。

    <Admonition type="info" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、**Bounded Staleness** がデフォルトに設定されています。
    
        ベクトル類似検索やクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**RETURN TYPE:**

*Collection*

**RETURNS:**

コレクションオブジェクトです。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    指定されたスキーマが無効な場合に、この例外が発生します。

## 例\{#examples}

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

## メンバー\{#members}

以下は `Collection` クラスのメンバーです:
