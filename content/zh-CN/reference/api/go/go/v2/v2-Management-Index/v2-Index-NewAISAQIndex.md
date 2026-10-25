---
title: "NewAISAQIndex | Go | v2"
slug: /go/go/v2-Index-NewAISAQIndex
sidebar_label: "NewAISAQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为向量字段创建 AISAQ 索引配置。AISAQ 将倒排文件组织与乘积量化的辅助存储分层结合；您可以通过其构建器方法进行调整。 | Go | v2"
type: docx
token: DIoqdCpn0o0y2sxi2QtcIGsynbc
sidebar_position: 27
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus Benchmark
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewAISAQIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewAISAQIndex

此操作会为向量字段创建 AISAQ 索引配置。AISAQ 将倒排文件组织与乘积量化的辅助存储分层结合；您可以通过其构建器方法进行调整。

```go
func NewAISAQIndex(metricType MetricType) *aisaqIndex
```

## 请求语法\{#request-syntax}

使用给定的度量类型创建 AISAQ 索引配置。

```go
NewAISAQIndex(metricType MetricType) *aisaqIndex
```

**参数：**

- **metricType** （[MetricType](./v2-Management-MetricType)） -

    **[必需]**

**构建器方法：**

- `WithInlinePQ(inlinePQ int) *aisaqIndex`

    设置内联乘积量化级别。

- `WithNumEntryPoints(numEntryPoints int) *aisaqIndex`

    设置入口点数量。

- `WithPQCacheSize(bytes int) *aisaqIndex`

    设置乘积量化的缓存大小，单位为字节。

- `WithPQReadIOEngine(engine string) *aisaqIndex`

    设置用于乘积量化读取的 IO 引擎。

- `WithPQReadPageCacheSize(bytes int) *aisaqIndex`

    设置用于乘积量化读取的页缓存大小。

- `WithRearrange(rearrange bool) *aisaqIndex`

    设置是否启用数据重新排列。

**返回类型：**

&ast;*aisaqIndex*

**返回：**

返回 AISAQ 索引配置实例。

**参数：**

- **index** （&ast;*aisaqIndex*） -

    AISAQ 索引配置实例。通过索引选项将其传递给 CreateIndex()。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 NewAISAQIndex 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewAISAQIndex(entity.MetricTypeIP)))
if err != nil {
	// handle error
}
```
