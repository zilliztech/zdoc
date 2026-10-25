---
title: "CommitImport | Go | v2"
slug: /go/go/v2-DataImport-CommitImport
sidebar_label: "CommitImport"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 RESTful 导入 API 提交批量导入任务。适用于先暂存数据、最后再提交的导入模式，例如当导入任务需要显式执行最终提交后，导入的数据才可查询。 | Go | v2"
type: docx
token: YimZdGvFVoS8k6xn4yWczFxqnwg
sidebar_position: 13
keywords: 
  - 最近邻搜索
  - LLM 评估
  - 稀疏向量与稠密向量
  - 稠密向量
  - zilliz
  - zilliz cloud
  - 云
  - CommitImport
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CommitImport

此操作通过 RESTful 导入 API 提交批量导入任务。它适用于先暂存数据、最后再提交的导入模式，例如当导入任务需要显式执行最终提交后，导入的数据才可查询。 

<Admonition type="info" title="Notes">

`CommitImport()` 是 `github.com/milvus-io/milvus/client/v3/bulkwriter` 中的包级函数，而不是 `*milvusclient.Client` 上的方法。它直接调用 REST `/v2/vectordb/jobs/import/commit` Endpoint，因此同时适用于 Milvus 开源集群（使用 `NewCommitImportOption`）和 Zilliz Cloud（使用 `NewCloudCommitImportOption`）。

</Admonition>

```go
func CommitImport(ctx context.Context, option *CommitImportOption) (*CommitImportResponse, error)
```

## 请求语法\{#request-syntax}

为 CommitImport() 创建请求。

```go
option := bulkwriter.NewCommitImportOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.CommitImport(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -

    用于取消和设置截止时间的上下文。HTTP 请求会继承此上下文，因此取消该上下文会中止正在进行的调用。

- **option** (*CommitImportOption*) -

    使用 `NewCommitImportOption()` 为自托管 Milvus 创建的提交选项，或使用 `NewCloudCommitImportOption()` 为 Zilliz Cloud 创建的提交选项。需要提供 `BulkImport()` 返回的任务 ID。

**返回类型：**

&ast;*CommitImportResponse, error*

**返回：**

一个嵌入通用 `Status` 和 `Message` 字段的 `CommitImportResponse`。如果请求无法序列化、HTTP 调用失败或服务器返回非零状态，则返回错误。

```go
type CommitImportResponse struct {
    ResponseBase
}
```

**参数：**

- **Status** (*int*) -

    继承自 `ResponseBase`。值为 `0` 表示成功；其他任何值表示错误。

- **Message** (*string*) -

    继承自 `ResponseBase`。当 `Status` 非零时，为人类可读的错误描述。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。常见失败包括选项载荷格式错误、网络错误、身份验证被拒绝（`WithAPIKey` 设置不正确时）以及通过响应状态呈现的服务器端验证错误。

## 示例\{#example}

演示 CommitImport() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewCommitImportOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.CommitImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

if resp.Status != 0 {
	log.Fatalf("commit import failed: %s", resp.Message)
}
```
