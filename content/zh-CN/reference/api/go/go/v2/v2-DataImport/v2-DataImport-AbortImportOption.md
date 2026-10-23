---
title: "AbortImportOption | Go | v2"
slug: /go/go/v2-DataImport-AbortImportOption
sidebar_label: "AbortImportOption"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "AbortImportOption 实例用于配置通过 RESTful API 中止批量导入任务的请求。 | Go | v2"
type: docx
token: DJ3VdUmf7o3QCdx1mTecsDaunHf
sidebar_position: 11
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw 算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - AbortImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImportOption

AbortImportOption 实例用于配置通过 RESTful API 中止批量导入任务的请求。

<Admonition type="info" title="Notes">

对于自托管 Milvus，请使用 `NewAbortImportOption()` 构造该实例；对于 Zilliz Cloud，请使用 `NewCloudAbortImportOption()`。

</Admonition>

<Admonition type="info" title="Notes">

通过链式调用 `WithAPIKey()` 添加授权令牌。

</Admonition>

```go
type AbortImportOption struct {
    URL string
    JobID string
    ClusterID string
    APIKey string
}
```

**字段：**

- **URL** （*string*） -

    Milvus 或 Zilliz Cloud 集群的基础 URL。请勿包含路径；该函数会自动追加 `/v2/vectordb/jobs/import/abort`。

- **JobID** （*string*） -

    要中止的导入任务的唯一标识符。请传入 `BulkImport()` 返回的值。必需。

- **ClusterID** （*string*） -

    Zilliz Cloud 集群 ID。可选；仅用于云端导入。

- **APIKey** （*string*） -

    作为 `Bearer` 标头发送的授权令牌。可选；当服务器强制实施基于令牌的身份验证时，此项为必需。

**构建器方法：**

- `WithAPIKey(key string)`

    此方法设置作为 `Bearer` 标头发送的授权令牌。

- `NewAbortImportOption(uri string, jobID string)`

    创建用于 AbortImport() 的请求。

- `NewCloudAbortImportOption(uri string, jobID string, apiKey string, clusterID string)`

    创建针对 Zilliz Cloud 的 AbortImport() 请求。

**方法：**

- `GetRequest() ([]byte, error)`

## 示例\{#example}

演示 AbortImportOption 的用法。

```go
import (
	"context"

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

err := cli.AbortImport(ctx, milvusclient.NewAbortImportOption("<jobId>"))
if err != nil {
	// handle error
}
```
