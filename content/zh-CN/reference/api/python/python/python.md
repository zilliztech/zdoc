---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Python SDK 参考

[PyMilvus](https://github.com/milvus-io/pymilvus) Python SDK 是 Milvus 和 Zilliz Cloud 的官方 Python 客户端。它同时提供基于 `MilvusClient` 的高级函数式 API，以及传统的 ORM 风格 API，便于开发者根据不同的项目需求、代码风格和使用场景选择合适的访问方式来完成数据写入、查询、搜索与管理等操作。

## 功能特性

- **MilvusClient** — 面向常见操作的简化函数式 API，适合快速集成与日常开发
- **ORM API** — 传统的对象关系映射风格 API，适用于已经基于旧接口构建的代码
- **Bulk import** — 提供本地和远程 bulk writer，用于大规模数据导入
- **Embedding models** — 通过 `pymilvus[model]` 集成支持文本与图像 embedding
- **Rerankers** — 内置用于混合搜索的重排序函数

## 安装与更新

你可以在终端中运行以下命令来安装最新的 PyMilvus，或将现有的 PyMilvus 更新到此版本。

```shell
pip install --upgrade pymilvus==v2.3.7
```

安装完成后，你可以运行以下代码检查 `pymilvus` 的版本。

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

## 版本更新内容

在此版本中，PyMilvus 新增了 `MilvusClient` 模块。该模块整合了多种函数式方法，使其整体功能与传统 ORM 模块更加对齐，从而让开发者在保留原有能力覆盖范围的同时，以更直接、更简洁的方式完成常用操作。

import DocCardList from '@theme/DocCardList';

<DocCardList />

## 示例

除了本文档外，你还可以参考我们 [GitHub repository](https://github.com/milvus-io/pymilvus) 中的[示例集合](https://github.com/milvus-io/pymilvus/tree/master/examples)，了解更多实际用法与集成示例。
