---
title: "upsert() | Python | MilvusClient"
slug: /python/python/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作可在指定 Collection 中插入新数据或更新现有数据，并支持对数组字段进行可选的部分更新。 | Python | MilvusClient"
type: docx
token: UjjpdBwaooRDdlxFHScc6dKwnTg
sidebar_position: 8
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

此操作可在指定 Collection 中插入新数据或更新现有数据，并支持对数组字段进行可选的部分更新。

<Admonition type="info" icon="📘" title="Notes">

外部 Collection 不支持此操作。

</Admonition>

## 请求语法\{#request-syntax}

```python
upsert(
    collection_name: str,
    data: Union[Dict, List[Dict]],
    timeout: Optional[float] = None,
    partition_name: Optional[str] = "",
    **kwargs,
) -> MutationResult
```

**参数：**

- **collection_name** (*str*) -<br/>
  **[必填]**<br/>
  要执行 upsert 操作的 Entity 所在 Collection 的名称。

- **data** (*Union[Dict, List[Dict]]*) -<br/>
  **[必填]**<br/>
  要执行 upsert 操作的 Entity。可迭代输入将在必要时转换为列表。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  RPC 的最大等待时长（秒）。该值将覆盖客户端的默认设置。

- **partition_name** (*Optional[str]*) -<br/>
  默认值：`""`<br/>
  要执行 upsert 操作的 Entity 所在 Partition 的名称。

- **kwargs** (*Any*) -<br/>
  其他 upsert 选项。

    - **partial_update** (*bool*) -<br/>
      默认值：`False`<br/>
      用于控制是否仅更新指定字段的标志。当设置为 `True` 时，未指定的字段将保持不变。

    - **field_ops** (*Optional[Dict[str, Any]]*) -<br/>
      默认值：`None`<br/>
      部分更新期间应用的逐字段合并操作。每个值可以是 `FieldOp` 工厂结果、`array_append`、`array_remove` 或 `replace`，也可以是 `FieldPartialUpdateOp` 消息。除 `replace` 外的任何操作均会启用部分更新。

**返回类型：**

*MutationResult*

**返回值：**

变更结果，包含 upsert 操作返回的主键及计数信息。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取具体的失败详情。

## 示例\{#examples}

演示 upsert 的用法。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[{"id": 1, "vector": [0.1, 0.2, 0.3], "tags": ["science"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```
