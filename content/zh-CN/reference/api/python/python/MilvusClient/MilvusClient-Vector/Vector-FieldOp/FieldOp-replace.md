---
title: "replace() | Python | MilvusClient"
slug: /python/python/FieldOp-replace
sidebar_label: "replace()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "在 upsert 期间为字段创建显式的替换操作。 | Python | MilvusClient"
type: docx
token: ES6KdwdwUoN700xriVUcS3EBnVc
sidebar_position: 5
keywords: 
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - replace()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# replace()

在 upsert 期间为字段创建显式的替换操作。

## 请求语法\{#request-syntax}

```python
FieldOp.replace() -> FieldPartialUpdateOp
```

**返回类型：**

*FieldPartialUpdateOp*

**返回：**

用于选择替换行为的操作消息。未提供字段操作时，替换也是默认行为。

## 示例\{#examples}

创建显式的替换操作值。

```python
from pymilvus import FieldOp

op = FieldOp.replace()
print(op)
```
