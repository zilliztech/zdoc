---
title: "FieldOp | Python | MilvusClient"
slug: /python/python/Vector-FieldOp
sidebar_label: "FieldOp"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "用于字段级部分更新操作的工厂类。 | Python | MilvusClient"
type: docx
token: LKTzdLal1oEAJYxzEWJcfgkgnhb
sidebar_position: 3
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 近邻算法
  - zilliz
  - zilliz cloud
  - 云
  - FieldOp
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# FieldOp

用于字段级部分更新操作的工厂类。

**返回类型：**

*FieldOp*

**返回：**

工厂类，其静态方法用于创建字段部分更新操作消息。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解确切的失败详情。

## 示例\{#examples}

使用 FieldOp.array_append() 追加值，而不是替换现有数组。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[{"id": 1, "vector": [0.1, 0.2, 0.3], "tags": ["science"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```
