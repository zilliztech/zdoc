---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Python SDK 参考

[PyMilvus](https://github.com/milvus-io/pymilvus) Python SDK 是 Milvus 和 Zilliz Cloud 的官方 Python 客户端。它既通过 `MilvusClient` 提供高级函数式 API，也提供传统的 ORM 风格 API。

## 功能特性

- **MilvusClient** — 用于常见操作的简化函数式 API
- **ORM API** — 传统的对象关系映射风格 API
- **Bulk import** — 用于大规模数据摄取的本地和远程批量写入器
- **Embedding models** — 通过 `pymilvus[model]` 集成支持文本和图像嵌入
- **Rerankers** — 用于混合搜索的内置重排函数

## 安装与更新

您可以在终端中运行以下命令，以安装最新版本的 PyMilvus，或将您的 PyMilvus 更新到此版本。

```shell
pip install --upgrade pymilvus==v2.3.7
```

安装完成后，您可以运行以下命令检查 pymilvus 版本。

```python
from pymilvus import __version__

print(__version__)

# v2.3.7
```

## 连接到集群

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token
)
```

## 新特性

在此版本中，PyMilvus 新增了一个 MilvusClient 模块，其中包含多个函数式方法，使其整体功能与传统 ORM 模块保持一致。

import DocCardList from '@theme/DocCardList';

<DocCardList />

## 示例

除文档外，您还可以参阅我们 [GitHub repository](https://github.com/milvus-io/pymilvus) 中的[示例集](https://github.com/milvus-io/pymilvus/tree/master/examples)。
