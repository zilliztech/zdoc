---
title: "add_field() | Python | MilvusClient"
slug: /python/python/CollectionSchema-add_field
sidebar_label: "add_field()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection のスキーマにフィールドを追加します。 | Python | MilvusClient"
type: docx
token: N3Fbd0ZZVoFo8DxJ9r8cNgcCnOd
sidebar_position: 1
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - add_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_field()

この操作は、collection のスキーマにフィールドを追加します。

## Request Syntax\{#request-syntax}

```python
add_field(
    field_name: str,
    datatype: DataType,
    **kwargs
)
```

**PARAMETERS:**

- **field_name** (*string*) - 

    **[REQUIRED]**

    フィールドの名前。

- **[datatype](./Collections-DataType)** (*[DataType](./Collections-DataType)*) - 

    **[REQUIRED]**

    フィールドのデータ型。

    さまざまなフィールドのデータ型を選択する際には、次のオプションから選択できます。

    - Primary key フィールド: **DataType.INT64** または **DataType.VARCHAR** を使用します。

    - Scalar フィールド: 次のようなさまざまなオプションから選択します。 

        - **DataType.BOOL**,

        - **DataType.INT8**,

        - **DataType.INT16**,

        - **DataType.INT32**,

        - **DataType.INT64**,

        - **DataType.FLOAT**,

        - **DataType.DOUBLE**,

        - **DataType.VARCHAR**,

        - **DataType.TEXT**

    - Composite フィールド: 次のようなさまざまなオプションから選択します。 

        - **DataType.JSON**

        - **DataType.ARRAY**

    - Vector フィールド: **DataType.BINARY_VECTOR**、**DataType.FLOAT_VECTOR**、**DataType.FLOAT16_VECTOR**、**DataType.BFLOAT16_VECTOR**、**DataType.SPARSE_FLOAT_VECTOR**、または **DataType.INT8_VECTOR** を選択します。

- **is_primary** (*bool*) -

    現在のフィールドが collection 内の primary フィールドであるかどうか。

    これは外部 collection には適用されません。

    <Admonition type="info" icon="📘" title="Notes">

    - 各 collection には primary フィールドが 1 つだけあります。
    
    - primary フィールドは、**DataType.INT64** 型または **DataType.VARCHAR** 型のいずれかである必要があります。

    </Admonition>

- **max_length** (*int*) -

    挿入できる文字列の最大バイト長。マルチバイト文字（例: Unicode 文字）は 1 文字あたり 1 バイトを超える場合があるため、挿入する文字列のバイト長が指定された制限を超えないようにしてください。値の範囲: [1, 65,535]。

    これは DataType.VARCHAR フィールドでは必須です。DataType.TEXT フィールドではこのパラメータを省略してください。

- **element_type** (*str*) -

    フィールド値内の要素のデータ型。

    これは **DataType.ARRAY** フィールドでは必須です。

- **max_capacity** (*int*) -

    Array フィールド値内の要素数。

    これは **DataType.ARRAY** フィールドでは必須です。

- **dim** (*int*) -

    vector embedding の次元数。値は 1 より大きい整数である必要があります。

    これは **DataType.FLOAT_VECTOR**、**DataType.BINARY_VECTOR**、**DataType.FLOAT16_VECTOR**、または **DataType.BFLOAT16_VECTOR** 型のフィールドでは必須です。**DataType.SPARSE_FLOAT_VECTOR** を使用する場合は、このパラメータを省略してください。

- **is_partition_key** (*bool*) -

    現在のフィールドが partition key として機能するかどうか。各 collection には 1 つの partition key を設定できます。

    これは外部 collection には適用されません。

    <Admonition type="info" icon="📘" title="Note">

    partition key とは何ですか?
    
        partition 指向のマルチテナンシーを容易にするために、フィールドを partition key フィールドとして設定できます。これにより、Zilliz Cloud はフィールド値をハッシュ化し、指定された数の partition に応じてエンティティを分散します。
    
        エンティティを取得する際には、特定のフィールド値のエンティティを絞り込むために、partition key フィールドが boolean 式で使用されていることを確認してください。
    
        詳細については、[Use Partition Key](/docs/use-partition-key) および [Multi-tenancy](https://milvus.io/docs/multi_tenancy.md) を参照してください。

    </Admonition>

**RETURN TYPE:**

*[CollectionSchema](./MilvusClient-CollectionSchema)*

**RETURNS:**

スキーマに追加されたフィールドを含む **[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクト。

**EXCEPTIONS:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Add the primary key field
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True
)

# Add the vector field
schema.add_field(
    field_name="vector",
    datatype=FLOAT_VECTOR,
    dim=768
)

# Add a scalar field to the schema
schema.add_field(
    field_name="scalar_01",
    datatype=DataType.INT32
)

# Add a TEXT field for long source content
schema.add_field(
    field_name="content",
    datatype=DataType.TEXT,
    enable_analyzer=True
)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, 
#         {
#             'name': 'vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {'dim': 768}
#        }, 
#        {
#             'name': 'scalar_01', 
#             'description': '', 
#             'type': <DataType.INT32: 4>
#        }
#     ]
# }
```
