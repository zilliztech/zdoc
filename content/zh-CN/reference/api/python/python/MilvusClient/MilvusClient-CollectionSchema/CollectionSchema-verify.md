---
title: "verify() | Python | MilvusClient"
slug: /python/python/CollectionSchema-verify
sidebar_label: "verify()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会对 CollectionSchema 执行最终验证检查，以检测任何明显的问题。 | Python | MilvusClient"
type: docx
token: TfV3dOYPyoKVSMxShrTc9SZ2nqh
sidebar_position: 5
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# verify()

此操作会对 CollectionSchema 执行最终验证检查，以检测任何明显的问题。

## 请求语法\{#request-syntax}

```python
verify()
```

**参数：**

无

**返回类型：**

无

**返回值：**

无

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType  

# Create field schemas
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

# Create a CollectionSchema with field schemas

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call verify() to validate the schema 
schema.verify()
```

