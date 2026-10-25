---
title: "BulkImport | Go | v2"
slug: /go/go/v2-DataImport-BulkImport
sidebar_label: "BulkImport"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 RESTful 导入 API 向 Milvus 或 Zilliz Cloud 集群提交批量导入作业。当您需要加载已暂存到对象存储中或可通过文件路径列表访问的大型数据集时，请使用此操作。该调用会立即返回一个作业 ID；您可以使用 `GetImportProgress()` 跟踪该作业的进度，并使用 `ListImportJobs()` 列出未完成的作业。 | Go | v2"
type: docx
token: Dgy5deK30oq5pVxoy7lcgt9InPg
sidebar_position: 1
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - BulkImport
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BulkImport

此操作通过 RESTful 导入 API 向 Milvus 或 Zilliz Cloud 集群提交批量导入作业。当您需要加载已暂存到对象存储中或可通过文件路径列表访问的大型数据集时，请使用此操作。该调用会立即返回一个作业 ID；您可以使用 `GetImportProgress()` 跟踪该作业的进度，并使用 `ListImportJobs()` 列出未完成的作业。

<Admonition type="info" title="Notes">

`BulkImport()` 是 `github.com/milvus-io/milvus/client/v3/bulkwriter` 中的包级函数，而不是 `*milvusclient.Client` 上的方法。它直接调用 REST `/v2/vectordb/jobs/import/create` Endpoint，因此既适用于 Milvus 开源集群（使用 `NewBulkImportOption`），也适用于 Zilliz Cloud（使用 `NewCloudBulkImportOption`）。

</Admonition>

```go
func BulkImport(ctx context.Context, option *BulkImportOption) (*BulkImportResponse, error)
```

## 请求语法\{#request-syntax}

创建 BulkImport() 的请求。

```go
option := bulkwriter.NewBulkImportOption(uri, collectionName, files).
    WithPartition(partitionName).
    WithAPIKey(apiKey)

resp, err := bulkwriter.BulkImport(ctx, option)
```

**参数：**

- **ctx** （*context.Context*） -

    用于取消和截止时间的上下文。HTTP 请求会继承此上下文，因此取消它会中止正在进行的调用。

- **option** （[BulkImportOption](./v2-DataImport-BulkImportOption)） -

    完整填充的导入选项。对于自托管 Milvus，使用 `NewBulkImportOption()` 创建；对于 Zilliz Cloud，使用 `NewCloudBulkImportOption()` 创建。必填。

**返回类型：**

&ast;*BulkImportResponse, error*

**返回：**

返回一个 `BulkImportResponse`，其中在 `Data.JobID` 下包含分配的作业 ID。如果请求无法编组、HTTP 调用失败，或服务器返回非零状态，则返回错误。

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
        JobID string `json:"jobId"`
    } `json:"data"`
}
```

**参数：**

- **Status** （*int*） -

    继承自 `ResponseBase`。值为 `0` 表示成功；任何其他值表示错误。

- **Message** （*string*） -

    继承自 `ResponseBase`。当 `Status` 不为零时，提供人类可读的错误描述。

- **Data.JobID** （*string*） -

    分配给已提交批量导入作业的唯一标识符。将此标识符传递给 `GetImportProgress()` 以跟踪完成情况。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详细信息。常见失败包括格式错误的选项负载、网络错误、身份验证被拒绝（当 `WithAPIKey` 设置不正确时），以及通过响应状态返回的服务器端验证错误。

## 示例\{#example}

演示 BulkImport() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
collectionName := "quick_setup"
files := [][]string{
	{"data/part_001.json"},
	{"data/part_002.json"},
}

option := bulkwriter.NewBulkImportOption(milvusAddr, collectionName, files).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.BulkImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

fmt.Println(resp.Data.JobID)
```
