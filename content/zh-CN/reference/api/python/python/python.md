---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Python SDK 参考

[PyMilvus](https://github.com/milvus-io/pymilvus) Python SDK 是 Milvus 和 Zilliz Cloud 的官方 Python 客户端。它同时提供通过 `MilvusClient` 使用的高级函数式 API，以及传统的 ORM 风格 API，便于开发者根据使用场景选择更适合的接口方式。

## 功能特性

- **MilvusClient** — 面向常见操作的简化函数式 API
- **ORM API** — 传统的对象关系映射风格 API
- **批量导入** — 支持本地和远程 bulk writer，用于大规模数据导入
- **嵌入模型** — 通过 `pymilvus[model]` 集成支持文本和图像嵌入
- **重排序器** — 内置用于混合搜索的重排序函数

## 安装与更新

你可以在终端中运行以下命令来安装最新版本的 PyMilvus，或将当前的 PyMilvus 更新到此版本。

```shell
pip install --upgrade pymilvus==v2.3.7
```

安装完成后，你可以运行以下代码检查 `pymilvus` 的版本：

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

## 新增内容

在此版本中，PyMilvus 新增了 `MilvusClient` 模块，其中包含多个函数式方法，使其整体功能与传统 ORM 模块保持一致，帮助你以更直接的方式完成常见的向量数据库操作。

import DocCardList from '@theme/DocCardList';

<DocCardList />

## 示例

除本文档外，你还可以参考我们 [GitHub 仓库](https://github.com/milvus-io/pymilvus) 中的 [示例集](https://github.com/milvus-io/pymilvus/tree/master/examples)。
