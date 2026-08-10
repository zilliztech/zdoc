---
title: "list_file_resources() | Python"
slug: /python/python/FileResource-list_file_resources
sidebar_label: "list_file_resources()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "返回当前已在 Milvus 集群上注册的所有文件资源。每个条目都是一个 `FileResourceInfo` 对象，公开了资源通过 `addfileresource()` 注册时使用的 `name`，以及其指向的 `path`（已配置对象存储中的对象键）。单个资源没有专门的 \"get\" API —— `listfileresources()` 是检查已注册资源的规范方式。 | Python"
type: docx
token: VWCwdHpnbofX9pxw4D1chAghnJg
sidebar_position: 2
keywords: 
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - zilliz
  - zilliz cloud
  - 云
  - list_file_resources()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_file_resources()

返回当前已在 Milvus 集群上注册的所有文件资源。每个条目都是一个 `FileResourceInfo` 对象，公开了资源通过 `add_file_resource()` 注册时使用的 `name`，以及其指向的 `path`（已配置对象存储中的对象键）。单个资源没有专门的 "get" API —— `list_file_resources()` 是检查已注册资源的规范方式。

## 请求语法\{#request-syntax}

```python
list_file_resources(
    timeout: float | None = None,
    **kwargs
)
```

**参数**：

- **timeout** (*float* | *None*) -<br/>
   此操作的超时时长（以秒为单位）。值为 `None` 表示不应用超时。

**返回值**：

*list[FileResourceInfo]*

返回列表中的每个元素都公开以下属性：

- **name** (*str*) -<br/>
   注册资源时使用的名称。

- **path** (*str*) -<br/>
   已注册文件在对象存储中的键，包括 `rootPath` 前缀。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

resources = client.list_file_resources()
for r in resources:
    print(r.name, r.path)
# zh_terms file/zh_terms.txt
# en_stop_words file/stop_words.txt
```

