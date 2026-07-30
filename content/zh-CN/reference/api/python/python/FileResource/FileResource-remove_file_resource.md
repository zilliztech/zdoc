---
title: "remove_file_resource() | Python"
slug: /python/python/FileResource-remove_file_resource
sidebar_label: "remove_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "从 Milvus 集群中移除先前通过 `addfileresource()` 注册的文件资源。该调用是幂等的：移除当前未注册的名称也会成功完成，不会引发异常。 | Python"
type: docx
token: DLsXdlRA3odugzx4sIccnBVKn0d
sidebar_position: 3
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - remove_file_resource()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_file_resource()

从 Milvus 集群中移除先前通过 `add_file_resource()` 注册的文件资源。该调用是幂等的：移除当前未注册的名称也会成功完成，不会引发异常。

## 请求语法\{#request-syntax}

```python
remove_file_resource(
    name: str,
    timeout: float | None = None,
    **kwargs
)
```

**参数**：

- **name** (*str*) -
 要移除的资源名称，即最初传递给 `add_file_resource()` 的名称。

- **timeout** (*float* | *None*) -
 此操作的超时时长（以秒为单位）。值为 `None` 表示不应用超时限制。

**返回值**：

*None*

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.remove_file_resource(name="zh_terms")

# Removing a name that is not currently registered is a no-op.
client.remove_file_resource(name="already_gone")
```

