---
title: "get_compaction_state() | Python | ORM"
slug: /python/python/Collection-get_compaction_state
sidebar_label: "get_compaction_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取当前的 Compaction 状态。 | Python | ORM"
type: docx
token: AXcMd0xiOovIX6xR4ZrcKA15nwh
sidebar_position: 13
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - llm 幻觉
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - 云
  - get_compaction_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_state()

此操作用于获取当前的 Compaction 状态。 

## 请求语法\{#request-syntax}

```python
get_compaction_state(
    timeout: float | None
)
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作将超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Compact small segments
collection.compact()

# Check the compaction state
collection.get_compaction_state()

# CompactionState
#  - compaction id: 446738261026568285
#  - State: Completed
#  - executing plan number: 4
#  - timeout plan number: 0
#  - complete plan number: 4
```

## 相关操作\{#related-operations}

以下操作与 `get_compaction_state()` 相关：

- [compact()](./Collection-compact)

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [wait_for_compaction_completed()](./Collection-wait_for_compaction_completed)

