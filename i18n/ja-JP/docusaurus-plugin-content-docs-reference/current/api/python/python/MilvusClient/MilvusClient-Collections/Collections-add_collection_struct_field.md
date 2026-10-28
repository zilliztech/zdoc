---
title: "add_collection_struct_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_struct_field
sidebar_label: "add_collection_struct_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションに新しい nullable な struct フィールドを追加します。 | Python | MilvusClient"
type: docx
token: M97RdhP3Co4QadxrDFGcpV8EnYe
sidebar_position: 26
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_struct_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_collection_struct_field()

この操作は、既存のコレクションに新しい nullable な struct フィールドを追加します。

<Admonition type="info" title="Note">

既存のコレクションに struct フィールドを追加するには、既存のエンティティに新しいフィールドの値が存在しないため、nullable を True に設定する必要があります。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.add_collection_struct_field(
    collection_name: str,
    field_name: str,
    struct_schema: StructFieldSchema,
    max_capacity: int,
    desc: Optional[str] = None,
    timeout: Optional[float] = None
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    コレクションの名前。

- **field_name** (*str*) -

    **[REQUIRED]**

    新しい struct フィールドの名前。

- **struct_schema** (*[StructFieldSchema](./MilvusClient-StructFieldSchema)*) -

    **[REQUIRED]**

    追加する struct フィールドのスキーマ。その名前は field_name によって上書きされます。

- **max_capacity** (*int*) -

    **[REQUIRED]**

    struct フィールドが保持できる要素の最大数。

- **desc** (*Optional[str]*) -

    フィールドの簡単な説明。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間。これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし。

**例外:**

- **ParamError**

    **struct_schema** が `StructFieldSchema` インスタンスでない場合、または **nullable** が **True** に設定されていない場合に発生します。**struct_schema** が `StructFieldSchema` インスタンスでない場合、または **nullable** が **True** に設定されていない場合に発生します。

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient, DataType, StructFieldSchema

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# The target collection must exist first
client.create_collection(
    collection_name="my_collection",
    dimension=5,
)

# Build the struct field schema
struct_schema = StructFieldSchema(nullable=True)
struct_schema.add_field(
    "name",
    DataType.VARCHAR,
    max_length=64,
)
struct_schema.add_field("age", DataType.INT32)

client.add_collection_struct_field(
    collection_name="my_collection",
    field_name="profile",
    struct_schema=struct_schema,
    max_capacity=10,
)
```
