---
title: "BulkImport() | Go | v2"
slug: /go/go/v2-DataImport-BulkImport
sidebar_label: "BulkImport()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数通过 RESTful 导入 API 向 Milvus 或 Zilliz Cloud 集群提交批量导入任务。当你需要加载已暂存到对象存储中或可通过文件路径列表访问的大型数据集时，请使用此函数。该调用会立即返回一个作业 ID；可使用 `GetImportProgress()` 跟踪作业进度，并使用 `ListImportJobs()` 列出未完成的作业。 | Go | v2"
type: docx
token: KrkGdWfDqoZjS1xmQM5cA3xGnbE
sidebar_position: 1
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImport()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImport()

此函数通过 RESTful 导入 API 向 Milvus 或 Zilliz Cloud 集群提交批量导入任务。当你需要加载已暂存到对象存储中或可通过文件路径列表访问的大型数据集时，请使用此函数。该调用会立即返回一个作业 ID；可使用 `GetImportProgress()` 跟踪作业进度，并使用 `ListImportJobs()` 列出未完成的作业。

<Admonition type="info" icon="📘" title="注意">

`BulkImport()` 是 `github.com/milvus-io/milvus/client/v2/bulkwriter` 中的包级函数，而不是 `*milvusclient.Client` 上的方法。它会直接调用 REST `/v2/vectordb/jobs/import/create` 端点，因此既适用于 Milvus 开源集群（使用 `NewBulkImportOption`），也适用于 Zilliz Cloud（使用 `NewCloudBulkImportOption`）。

</Admonition>

```go
func BulkImport(ctx context.Context, option *BulkImportOption) (*BulkImportResponse, error)
```

## 请求语法\{#request-syntax}

```go
option := bulkwriter.NewBulkImportOption(uri, collectionName, files).
    WithPartition(partitionName).
    WithAPIKey(apiKey)

resp, err := bulkwriter.BulkImport(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -<br/>
  用于取消和截止时间控制的上下文。HTTP 请求会继承此上下文，因此取消该上下文会中止正在进行的调用。

- **option** (*BulkImportOption*) -<br/>
  完整填充的导入选项。对于自托管 Milvus，请使用 `NewBulkImportOption()` 创建；对于 Zilliz Cloud，请使用 `NewCloudBulkImportOption()` 创建。必填。

**返回类型：**

*\*BulkImportResponse, error*

**返回值：**

返回一个 `BulkImportResponse`，其中分配的作业 ID 位于 `Data.JobID` 中。如果请求无法被序列化、HTTP 调用失败，或者服务器返回非零状态，则会返回错误。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。常见失败包括：格式错误的选项负载、网络错误、身份验证被拒绝（当 `WithAPIKey` 设置不正确时），以及通过响应状态返回的服务端校验错误。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/bulkwriter"
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
