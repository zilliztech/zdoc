---
title: "FieldOpType | Python | MilvusClient"
slug: /python/python/FieldOp-FieldOpType
sidebar_label: "FieldOpType"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "字段级部分更新操作类型的枚举别名。 | Python | MilvusClient"
type: docx
token: I8zBdZOdaorBS1xAxl4cC4E5njf
sidebar_position: 4
keywords: 
  - Elastic 向量 Database
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - FieldOpType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldOpType

用于字段级部分更新操作类型的枚举别名。

## 示例\{#examples}

将操作消息与导出的枚举值进行比较。

```python
from pymilvus import FieldOp, FieldOpType

op = FieldOp.array_append()
assert op.op == FieldOpType.ARRAY_APPEND
```

## 说明\{#notes}

- REPLACE 会替换当前字段值。

- ARRAY_APPEND 会将传入元素追加到当前数组中。

- ARRAY_REMOVE 会从当前数组中移除所有匹配的传入元素。
