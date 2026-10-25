---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Hit 实例是聚合桶中的一份文档，包含其主键、相似度分数和输出字段。 | Python | MilvusClient"
type: docx
token: SSsbdMWqsoapZ8xQSRtcOXdInAh
sidebar_position: 12
keywords: 
  - LLM 幻觉
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - zilliz
  - zilliz cloud
  - 云
  - AggregationHit
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# AggregationHit

Hit 实例是聚合桶中的一份文档，包含其主键、相似度分数和输出字段。

**方法：**

- `pk`

    本文档的主键，为 int 或 string，具体取决于 Collection 的主字段类型。

- `score`

    本文档在其所属桶内的相似度分数。

- `fields`

    本文档的输出字段值，以 field_name 为键，并由服务器填充。

- `field_ids()`

    此 Hit 的数值标识视图，以 field_name 到 field_id 的映射表示当前存在的字段。

## 示例\{#examples}

```python
for hit in bucket["hits"]:
    print(
        hit["pk"],
        hit["score"],
        hit["fields"],
    )
```
