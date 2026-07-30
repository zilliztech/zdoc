---
title: "Go SDK 参考 | Cloud"
displayed_sidebar: goSidebar
slug: /go
sidebar_label: "概览"
sidebar_position: 3
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Go SDK 参考

Milvus 和 Zilliz Cloud 的官方 Go SDK 为向量数据库操作提供原生 Go 客户端。通过该 SDK，Go 开发者可以使用符合 Go 语言习惯的方式连接服务，并围绕集合、数据写入、查询、搜索以及其他常见向量数据库能力进行开发。本文档汇总了当前可用的 Go SDK 版本及其对应代码仓库，便于根据项目阶段和现有代码基础选择合适的版本。

## 版本

- **[Go SDK v1](./v1)** — 旧版（仓库已归档）。仅建议用于维护现有应用；如果你的项目已经基于该版本构建，可继续参考对应文档进行兼容性维护。
- **[Go SDK v2](./v2)** — 当前版本，在 Milvus 主仓库中持续维护。对于新项目以及计划升级的应用，通常应优先参考此版本的 API 文档和使用方式。

## 代码仓库

- **v1（已归档）：** [milvus-io/milvus-sdk-go](https://github.com/milvus-io/milvus-sdk-go)
- **v2（当前版本）：** [milvus-io/milvus/client](https://github.com/milvus-io/milvus/tree/master/client)

import DocCardList from '@theme/DocCardList';

<DocCardList />
