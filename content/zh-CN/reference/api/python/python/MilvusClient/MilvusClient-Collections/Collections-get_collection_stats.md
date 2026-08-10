---
title: "get_collection_stats() | Python | MilvusClient"
slug: /python/python/Collections-get_collection_stats
sidebar_label: "get_collection_stats()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 上收集的统计信息。 | Python | MilvusClient"
type: docx
token: VfaldXzLUocBrJxffw6cJHPinlh
sidebar_position: 13
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - get_collection_stats()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_collection_stats()

此操作列出特定 Collection 上收集的统计信息。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于 Dedicated 服务集群和按需计算。

- 对于服务集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
get_collection_stats(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    Collection 的名称。

- **timeout** (*Optional[float]*) -

    此操作的超时时长。将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

- **\&ast;\&ast;kwargs** -

    用于未来扩展的其他关键字参数。

**返回类型：**

*dict*

**返回：**

一个字典，包含指定 Collection 上收集的统计信息。

```python
{
    'row_count': 0
}
```

<Admonition type="info" icon="📘" title="Note">

为什么行数与插入的 Entity 数量不一致？

您插入的数据在最终保存之前会经过处理。起初，它会以数据流的形式到达。随后，它会作为 Entity 存储在 Segment 中。Milvus 会选择合适的增长中 Segment 来存储流式数据，直到其达到上限并被封存。

但是请注意，显示的行数可能与插入的记录数不一致，因为其中不包含流式数据。

</Admonition>

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

stats = client.get_collection_stats(
    collection_name="my_collection"
)

print(stats)
# Output: {'row_count': 100}
```
