---
title: "get_collection_stats() | Python | MilvusClient"
slug: /python/python/Collections-get_collection_stats
sidebar_label: "get_collection_stats()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出在特定集合上收集的统计信息。 | Python | MilvusClient"
type: docx
token: VfaldXzLUocBrJxffw6cJHPinlh
sidebar_position: 13
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - get_collection_stats()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_collection_stats()

此操作列出在特定集合上收集的统计信息。

<Admonition type="info" icon="📘" title="说明">

此方法适用于专属服务集群和按需计算。 

- 对于服务集群中的集合，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的集合，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**。

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

    集合的名称。

- **timeout** (*Optional[float]*) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任意响应或发生错误时超时结束。

- **\&ast;\&ast;kwargs** -

    用于未来扩展的其他关键字参数。

**返回类型：**

*dict*

**返回：**

一个包含指定集合已收集统计信息的字典。

```python
{
    'row_count': 0
}
```

<Admonition type="info" icon="📘" title="说明">

为什么行数与插入的实体数不一致？

插入的数据在最终保存之前会经过处理。最初，它会以数据流的形式到达。随后，它会作为实体存储在段中。Milvus 会选择一个合适的 Growing Segment（增长段）来存储流式数据，直到达到其上限并变为 Sealed Segment（密封段）。

但是，请注意，显示的行数可能与插入的记录数不一致，因为流式数据不计入其中。

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
