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

Go SDK 为 Zilliz Cloud 提供原生 Go 客户端。当前的 v2 模块在 Milvus 主仓库的 `client/` 目录下维护，并通过 `milvusclient` 包提供连接管理、Collection 操作、数据写入、向量搜索和集群管理能力。

## 功能特性

- **符合 Go 语言习惯的客户端** — 使用 `context.Context` 和类型化的 `ClientConfig` 创建 `milvusclient.Client`。
- **基于选项的请求** — 通过 `NewListCollectionOption()` 等构造函数以及可链式调用的选项方法来配置操作。
- **Collection 和索引管理** — 定义 Schema，创建 Collection 和索引，并管理 Collection 的加载。
- **数据和向量操作** — 使用类型化的向量和结果集执行插入、Upsert、删除、查询、搜索以及混合搜索。
- **云端管理** — 管理集群可用的 Database、Partition、别名、用户、角色和资源组。
- **Go 生态集成** — 在 SDK 操作中传递上下文和可选的 gRPC 调用选项，并在工作完成后显式关闭客户端。

## 安装

使用 `go get` 安装当前 v2 模块及其依赖项：

```bash
go get -u github.com/milvus-io/milvus/client/v2
```

请使用所选 SDK 模块的 `go.mod` 文件所要求的 Go 版本。

## 连接到 Zilliz Cloud

从集群的 **Connect** 卡片复制公网 Endpoint，并将 API key 或集群凭据用作 token。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
	APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
	log.Fatal(err)
}
defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(
	ctx,
	milvusclient.NewListCollectionOption(),
)
if err != nil {
	log.Fatal(err)
}

fmt.Println(collectionNames)
```

## 资源

- [Go SDK v2 参考](./go/go/v2-Client-ClientConfig)
- [Go SDK v2 源代码](https://github.com/milvus-io/milvus/tree/master/client)
- [Go 包文档](https://pkg.go.dev/github.com/milvus-io/milvus/client/v2)

import DocCardList from '@theme/DocCardList';

<DocCardList />
