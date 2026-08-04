---
title: "close() | Python | MilvusClient"
slug: /python/python/Client-close
sidebar_label: "close()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会关闭当前的 Milvus 客户端。 | Python | MilvusClient"
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量数据库教程
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# close()

此操作会关闭当前的 Milvus 客户端。

## 请求语法\{#request-syntax}

```python
close() -> None
```

**参数：**

无

**返回类型：**

*NoneType*

**返回值：**

无

**异常：**

无

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Close the client
client.close()
```

