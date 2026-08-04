---
title: "alter_index_properties() | Python | MilvusClient"
slug: /python/python/Management-alter_index_properties
sidebar_label: "alter_index_properties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作更改指定的索引属性。 | Python | MilvusClient"
type: docx
token: QvyHdbEHholEqXxypKNcHHD5n0c
sidebar_position: 14
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - alter_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_index_properties()

此操作更改指定的索引属性。

## 请求语法\{#request-syntax}

```python
alter_index_properties(
    self,
    collection_name: str,
    index_name: str,
    properties: dict,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **collection_name** (*str*) -

    目标集合的名称。

- **index_name** (*str*) -

    要更改的索引文件名称。

- **properties** (*dict*) -

    此操作完成后的属性及其值。可更改的属性包括：

    - **mmap.enabled** (*bool*) -

        是否为指定索引启用 mmap。将其设置为 `true` 会将指定索引卸载到磁盘上。详情请参见 [使用 mmap](/docs/use-mmap)

- **timeout** (*Optional[float]*) - 

    此操作的超时时长。

    将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

无

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. 创建一个 milvus 客户端
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 更新属性
properties = {"mmap.enabled": true}

client.alter_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    properties = properties
)
```

