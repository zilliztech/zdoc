---
title: "add_field() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-add_field
sidebar_label: "add_field()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、構造体配列フィールド内の構造体要素のスキーマにフィールドを追加します。 | Python | MilvusClient"
type: docx
token: ACHhd1AsKoJaHIxqnNfcV8ljnpd
sidebar_position: 1
keywords: 
  - Milvus とは
  - Milvus データベース
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
```

**PARAMETERS:**

- **field_name** (*string*) -

    **[REQUIRED]**

    フィールド名。

- **datatype** (*[DataType](../DataType.md*) -

    **[REQUIRED]**

    オプション（&ast;） - フィールドのデータ型です。異なるフィールドのデータ型を選択する場合は、次のオプションから選択できます。詳細は、Array of Structs を参照してください。

- **max_length** (*int*) -

    挿入できる文字列の最大バイト長です。マルチバイト文字（Unicode 文字など）は 1 文字あたり複数バイトを占める場合があるため、挿入する文字列のバイト長が指定した上限を超えないようにしてください。値の範囲は [1, 65,535] です。これは DataType.VARCHAR フィールドでは必須です。

- **dim** (*int*) -

    ベクトル埋め込みの次元数。値は 1 より大きい整数である必要があります。

- **mmap_enabled** (*bool*) -

    Milvus がフィールドデータを完全にロードする代わりにメモリにマップするかどうかを示すフラグです。詳細設定については、MMap 対応データストレージを参照してください。

**RETURN TYPE:**

*[StructFieldSchema](./MilvusClient-StructFieldSchema)*

**RETURNS:**

StructFieldSchema オブジェクトには、スキーマに追加されたフィールドが含まれます。

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中にエラーが発生した場合にスローされます。この例外は、この操作中にエラーが発生した場合にスローされます。

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
