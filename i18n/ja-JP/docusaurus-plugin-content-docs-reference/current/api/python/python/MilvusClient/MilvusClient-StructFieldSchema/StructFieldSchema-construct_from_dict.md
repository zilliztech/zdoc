---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、辞書表現から StructFieldSchema オブジェクトを構築します。 | Python | MilvusClient"
type: docx
token: KeoHdMDBCo3PByxKbWncifFMn9e
sidebar_position: 2
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

この操作は、辞書表現から **[StructFieldSchema](./MilvusClient-StructFieldSchema)** オブジェクトを構築します。

## Request Syntax\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**PARAMETERS:**

- **raw** (*dict*)

    struct の配列フィールド内の struct 要素のスキーマを構築するための生データを含む辞書。

**RETURN TYPE:**

*[StructFieldSchema](./MilvusClient-StructFieldSchema)*

**RETURNS:**

**[StructFieldSchema](./MilvusClient-StructFieldSchema)** オブジェクト。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import DataType, FieldSchema, StructFieldSchema

vector = FieldSchema(
    name="vector_02",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

varchar = FieldSchema(
    name="varchar_02",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Create dictionary representation 
schema_dict = {
    "fields": [     
        vector.to_dict(),
        varchar.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = StructFieldSchema(name="struct_schema", fields=[vector]).construct_from_dict(schema_dict)  

print(schema)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```
