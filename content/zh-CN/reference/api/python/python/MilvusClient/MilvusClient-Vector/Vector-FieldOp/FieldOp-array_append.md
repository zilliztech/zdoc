---
title: "array_append() | Python | MilvusClient"
slug: /python/python/FieldOp-array_append
sidebar_label: "array_append()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "创建一个操作，用于在 upsert 期间将传入的数组元素追加到现有字段值。 | Python | MilvusClient"
type: docx
token: S7Otdiukfo0a4GxNUWpcQca3nSb
sidebar_position: 1
keywords: 
  - 大语言模型
  - 机器学习
  - RAG
  - 自然语言处理
  - zilliz
  - Zilliz Cloud
  - 云
  - array_append()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# array_append()

创建一个操作，用于在 upsert 期间将传入的数组元素追加到现有字段值。

## 请求语法\{#request-syntax}

```python
FieldOp.array_append() -> FieldPartialUpdateOp
```

**返回类型：**

*FieldPartialUpdateOp*

**返回：**

用于选择 ARRAY_APPEND 行为的操作消息。

## 示例\{#examples}

将 ARRAY_APPEND 应用于 tags 字段。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[
        {
            "id": 1,
            "vector": [0.1, 0.2, 0.3, 0.4],
            "tags": ["science"],
        }
    ],
    field_ops={"tags": FieldOp.array_append()},
)
```
