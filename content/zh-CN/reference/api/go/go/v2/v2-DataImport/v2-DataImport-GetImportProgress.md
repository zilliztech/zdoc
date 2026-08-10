---
title: "GetImportProgress() | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数通过 RESTful API 检索单个批量导入任务的详细进度。您可以使用它轮询由 `BulkImport()` 提交的任务，直到其 `State` 达到 `Completed` 或 `Failed`。响应包含总体进度、已导入的总/expected行数、文件大小以及每个文件的进度详情。 | Go | v2"
type: docx
token: V05sd0bGjo33Cux0j9DcrNKTndh
sidebar_position: 4
keywords: 
  - 图像搜索
  - LLMs
  - 机器学习
  - RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetImportProgress()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgress()

此函数通过 RESTful API 检索单个批量导入任务的详细进度。您可以使用它轮询由 `BulkImport()` 提交的任务，直到其 `State` 达到 `Completed` 或 `Failed`。响应包含总体进度、已导入的总/expected行数、文件大小以及每个文件的进度详情。

<Admonition type="info" icon="📘" title="Notes">

`GetImportProgress()` 是 `github.com/milvus-io/milvus/client/v2/bulkwriter` 中的一个包级函数。它调用 REST `/v2/vectordb/jobs/import/describe` Endpoint，并同时适用于 Milvus 开源集群（使用 `NewGetImportProgressOption`）和 Zilliz Cloud（使用 `NewCloudGetImportProgressOption`）。

</Admonition>

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
```

## 请求语法\{#request-syntax}

```go
option := bulkwriter.NewGetImportProgressOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.GetImportProgress(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -<br/>
  用于取消和截止时间的上下文。HTTP 请求会继承此上下文，因此取消它会中止正在进行的调用。

- **option** (*GetImportProgressOption*) -<br/>
  对于自托管 Milvus，使用 `NewGetImportProgressOption()` 创建进度选项；对于 Zilliz Cloud，使用 `NewCloudGetImportProgressOption()` 创建。必须提供由 `BulkImport()` 返回的作业 ID。必填。

**返回类型：**

*\*GetImportProgressResponse, error*

**返回值：**

返回一个 `GetImportProgressResponse`，其 `Data` 字段包含一个 `ImportProgressData`，其中包括总体进度、行数统计、完成时间以及每个文件的 `Details`。如果请求无法编组、HTTP 调用失败，或者服务器返回非零状态，则返回错误。

**异常：**

- **error**

    请检查 `err != nil` 以获取失败详情。失败情况包括选项格式错误、网络问题、未知或已过期的作业 ID，以及通过响应状态报告的服务器端错误。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/milvus-io/milvus/client/v2/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewGetImportProgressOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

for {
	resp, err := bulkwriter.GetImportProgress(ctx, option)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("State=%s Progress=%d%% Rows=%d/%d\n",
		resp.Data.State, resp.Data.Progress, resp.Data.ImportedRows, resp.Data.TotalRows)

	if resp.Data.State == "Completed" || resp.Data.State == "Failed" {
		break
	}
	time.Sleep(2 * time.Second)
}
```
