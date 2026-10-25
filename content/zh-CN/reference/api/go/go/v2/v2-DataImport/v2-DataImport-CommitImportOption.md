---
title: "CommitImportOption | Go | v2"
slug: /go/go/v2-DataImport-CommitImportOption
sidebar_label: "CommitImportOption"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "CommitImportOption 实例用于配置通过 RESTful API 提交批量导入任务的请求。对于自托管 Milvus，请使用 `NewCommitImportOption()` 构造该实例；对于 Zilliz Cloud，请使用 `NewCloudCommitImportOption()` 构造该实例。可链式调用 `WithAPIKey()` 添加授权令牌。 | Go | v2"
type: docx
token: BS6adI4NSoFJgyxp7dDcSbitnnb
sidebar_position: 14
keywords: 
  - 音频相似度搜索
  - Elastic 向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - Zilliz
  - Zilliz Cloud
  - 云
  - CommitImportOption
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CommitImportOption

CommitImportOption 实例用于配置通过 RESTful API 提交批量导入任务的请求。对于自托管 Milvus，请使用 `NewCommitImportOption()` 构造该实例；对于 Zilliz Cloud，请使用 `NewCloudCommitImportOption()` 构造该实例。可链式调用 `WithAPIKey()` 添加授权令牌。

```go
type CommitImportOption struct {
    URL string
    JobID string
    ClusterID string
    APIKey string
}
```

**字段：**

- **URL** （*string*） -

    Milvus 或 Zilliz Cloud 集群的基础 URL。请勿包含路径；该函数会自动追加 `/v2/vectordb/jobs/import/commit`。

- **JobID** （*string*） -

    要提交的导入任务的唯一标识符。请传入 `BulkImport()` 返回的值。必需。

- **ClusterID** （*string*） -

    Zilliz Cloud 集群 ID。可选；仅用于云端导入。

- **APIKey** （*string*） -

    作为 `Bearer` 请求头发送的授权令牌。可选；当服务器强制执行基于令牌的身份验证时，此字段为必需。

**构建器方法：**

- `WithAPIKey(key string)`

    设置作为 `Bearer` 请求头发送的授权令牌。

- `NewCommitImportOption(uri string, jobID string)`

    创建用于 CommitImport() 的请求。

- `NewCloudCommitImportOption(uri string, jobID string, apiKey string, clusterID string)`

    创建用于针对 Zilliz Cloud 执行 CommitImport() 的请求。

**方法：**

- `GetRequest() ([]byte, error)`

## 示例\{#example}

演示 CommitImportOption 的用法。

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

err := cli.CommitImport(ctx, milvusclient.NewCommitImportOption("<jobId>", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
```
