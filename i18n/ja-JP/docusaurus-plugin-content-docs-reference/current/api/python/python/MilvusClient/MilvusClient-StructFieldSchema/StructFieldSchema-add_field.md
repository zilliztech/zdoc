---
title: "add_field() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-add_field
sidebar_label: "add_field()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、構造体配列フィールド内の構造体要素のスキーマにフィールドを追加します。 | Python | MilvusClient"
type: docx
token: Up73d8d78oPM2FxkvlIcuxeBn9g
sidebar_position: 1
keywords: 
  - Milvus とは
  - Milvus database
  - Milvus lite
  - Milvus benchmark
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

この操作は、構造体配列フィールド内の構造体要素のスキーマにフィールドを追加します。

## Request Syntax\{#request-syntax}

```python
add_field(
    field_name: str,
    datatype: DataType
)
```

**PARAMETERS:**

- **field_name** (*string*) - 

    **[REQUIRED]**

    フィールド名。

- **[datatype](./Collections-DataType)** (*[DataType](./Collections-DataType)*) - 

    **[REQUIRED]**

    フィールドのデータ型。

    さまざまなフィールドのデータ型を選択する際には、次のオプションから選択できます。詳細については、[Array of Structs](/docs/use-array-of-structs) を参照してください。

- **max_length** (*int*) -

    挿入可能な文字列の最大バイト長。マルチバイト文字（例: Unicode 文字）は 1 文字あたり 1 バイトを超える場合があるため、挿入する文字列のバイト長が指定された制限を超えないようにしてください。値の範囲: [1, 65,535]。

    これは **DataType.VARCHAR** フィールドでは必須です。

- **dim** (*int*) -

    ベクトル埋め込みの次元数。値は 1 より大きい整数である必要があります。

- **mmap_enabled** (*bool*) -

    Milvus がフィールドデータを完全にロードする代わりにメモリにマップするかどうか。設定の詳細については、MMap-enabled Data Storage を参照してください。

**RETURN TYPE:**

*[StructFieldSchema](./MilvusClient-StructFieldSchema)*

**RETURNS:**

スキーマに追加されたフィールドを含む **[StructFieldSchema](./MilvusClient-StructFieldSchema)** オブジェクト。

**EXCEPTIONS:**

- **MilvusException**

    この操作中にエラーが発生した場合に、この例外がスローされます。

## Examples\{#examples}

```python
from pymilvus import DataType, FieldSchema, StructFieldSchema

schema = StructFieldSchema(
    name="struct_schema",
    fields=[vector, varchar]
)

# Add the vector field
schema.add_field(
    field_name="vector_02",
    datatype=DataType.FLOAT_VECTOR,
    dim=768
)

# Add a scalar field to the schema
schema.add_field(
    field_name="scalar_01",
    datatype=DataType.INT32
)
```
