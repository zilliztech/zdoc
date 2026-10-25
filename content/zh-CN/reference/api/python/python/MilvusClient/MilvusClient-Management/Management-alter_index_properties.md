---
title: "alter_index_properties() | Python | MilvusClient"
slug: /python/python/Management-alter_index_properties
sidebar_label: "alter_index_properties()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改指定索引的属性。 | Python | MilvusClient"
type: docx
token: GzNUdJIhVoWjgLxEimrctGvUnJg
sidebar_position: 14
keywords: 
  - 开源向量 Database
  - 向量索引
  - 向量 Database 开源
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - alter_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_index_properties()

此操作会更改指定索引的属性。

<Admonition type="info" title="Notes">

此方法仅适用于 dedicated serving 集群和按需计算。

- 如果要对 serving 集群中的 Collection 执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如果要对按需计算中的 Collection 执行此操作，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以连接到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
alter_index_properties(
```

**参数：**

- **collection_name** (*str*) -

    目标 Collection 的名称。

- **index_name** (*str*) -

    要更改的索引文件名称。

- **properties** (*dict*) -

    此操作后的属性及其值。可更改的属性包括：mmap.enabled（bool）：是否为指定索引启用 mmap。将其设置为 true 会将指定索引卸载到磁盘。详情请参见 Mmap-enabled Data Storage。

- **timeout** (*Optional[float]*) -

    此操作的超时时长。将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# update properties
properties = {"mmap.enabled": True}

client.alter_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    properties = properties
)
```
