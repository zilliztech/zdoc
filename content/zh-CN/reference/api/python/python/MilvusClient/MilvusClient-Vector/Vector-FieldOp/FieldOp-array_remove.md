---
title: "array_remove() | Python | MilvusClient"
slug: /python/python/FieldOp-array_remove
sidebar_label: "array_remove()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "创建一个操作，用于在 upsert 期间从现有字段值中移除匹配的数组元素。 | Python | MilvusClient"
type: docx
token: Ki33dZaE6oZq0fxDSHcc9cKzn5d
sidebar_position: 2
keywords: 
  - 什么是向量 Database
  - 向量 Database
  - 多模态向量 Database 检索
  - 检索增强生成
  - Zilliz
  - Zilliz Cloud
  - 云
  - array_remove()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# array_remove()

创建一个操作，用于在 upsert 期间从现有字段值中移除匹配的数组元素。

## 请求语法\{#request-syntax}

```python
FieldOp.array_remove() -> FieldPartialUpdateOp
```

**返回类型：**

*FieldPartialUpdateOp*

**返回：**

选择 ARRAY_REMOVE 行为的操作消息。

## 示例\{#examples}

将 ARRAY_REMOVE 应用于 tags 字段。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[
        {
            "id": 1,
            "vector": [0.1, 0.2, 0.3, 0.4],
            "tags": ["obsolete"],
        }
    ],
    field_ops={"tags": FieldOp.array_remove()},
)
```
