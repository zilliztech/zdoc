---
title: "upsert() | Python | MilvusClient"
slug: /python/python/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "为部分数组更新添加 field_ops 支持。异步变体与同步方法共享相同的参数契约。 | Python | MilvusClient"
type: docx
token: UjjpdBwaooRDdlxFHScc6dKwnTg
sidebar_position: 8
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
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

为部分数组更新添加 `field_ops` 支持。异步变体与同步方法共享相同的参数契约。

<Admonition type="info" icon="📘" title="说明">

外部集合不支持此操作。

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
  要将实体 upsert 到的集合名称。

- **data** (*Union[Dict, List[Dict]]*) -<br/>
  **[必填]**<br/>
  要 upsert 的实体。必要时，可迭代输入会被转换为列表。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 的最长时间，单位为秒。此值会覆盖客户端默认值。

- **partition_name** (*Optional[str]*) -<br/>
  默认值：`""`<br/>
  要将实体 upsert 到的分区名称。

- **kwargs** (*Any*) -<br/>
  其他 upsert 选项。

    - **partial_update** (*bool*) -<br/>
      默认值：`False`<br/>
      用于控制是否仅更新指定字段的标志。为 `True` 时，未指定的字段保持不变。

    - **field_ops** (*Optional[Dict[str, Any]]*) -<br/>
      默认值：`None`<br/>
      在部分更新期间按字段应用的合并操作。每个值都可以是 `FieldOp` 工厂结果、`array_append`、`array_remove` 或 `replace`，也可以是 `FieldPartialUpdateOp` 消息。除 `replace` 之外的任何操作都会启用部分更新。

**返回类型：**

*MutationResult*

**返回值：**

包含此次 upsert 操作返回的主键和计数信息的变更结果。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

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
