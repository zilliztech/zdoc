---
title: "GetImportProgress | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 RESTful API 检索单个批量导入作业的详细进度。使用它轮询由 `BulkImport()` 提交的作业，直到其 `State` 达到 `Completed` 或 `Failed`。响应包含总体进度、总已导入/expected 行数、文件大小以及每个文件的进度详情。 | Go | v2"
type: docx
token: XwEZdXtExoaU4IxWu4yc6HiQnph
sidebar_position: 4
keywords: 
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - ANNS
  - zilliz
  - zilliz cloud
  - 云
  - GetImportProgress
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetImportProgress

此操作通过 RESTful API 检索单个批量导入作业的详细进度。使用它轮询由 `BulkImport()` 提交的作业，直到其 `State` 达到 `Completed` 或 `Failed`。响应包含总体进度、总已导入/expected 行数、文件大小以及每个文件的进度详情。

<Admonition type="info" title="Notes">

`GetImportProgress()` 是 `github.com/milvus-io/milvus/client/v3/bulkwriter` 中的包级函数。它调用 REST `/v2/vectordb/jobs/import/describe` Endpoint，并且同时适用于 Milvus 开源集群（使用 `NewGetImportProgressOption`）和 Zilliz Cloud（使用 `NewCloudGetImportProgressOption`）。

</Admonition>

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
```

## 请求语法\{#request-syntax}

创建 GetImportProgress() 的请求。

```go
option := bulkwriter.NewGetImportProgressOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.GetImportProgress(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -

    用于取消和截止时间的上下文。HTTP 请求会继承此上下文，因此取消该上下文会中止正在进行的调用。

- **option** ([GetImportProgressOption](./v2-DataImport-GetImportProgressOption)) -

    针对自托管 Milvus 使用 `NewGetImportProgressOption()` 创建、或针对 Zilliz Cloud 使用 `NewCloudGetImportProgressOption()` 创建的进度选项。必须提供由 `BulkImport()` 返回的作业 ID。必需。

**构建器方法：**

- `NewGetImportProgressOption(uri string, jobID string)`

    创建 GetImportProgress() 的请求。

- `NewCloudGetImportProgressOption(uri string, jobID string, apiKey string, clusterID string)`

    创建针对 Zilliz Cloud 的 GetImportProgress() 请求。

**返回类型：**

&ast;*GetImportProgressResponse, error*

**返回：**

返回一个 `GetImportProgressResponse`，其 `Data` 字段包含一个 `ImportProgressData`，其中带有总体进度、行数统计、完成时间以及每个文件的 `Details`。如果请求无法编组、HTTP 调用失败，或者服务器返回非零状态，则返回错误。

```go
type GetImportProgressResponse struct {
    ResponseBase
    Data *ImportProgressData `json:"data"`
}

type ImportProgressData struct {
    CollectionName string                  `json:"collectionName"`
    JobID          string                  `json:"jobId"`
    CompleteTime   string                  `json:"completeTime"`
    State          string                  `json:"state"`
    Progress       int64                   `json:"progress"`
    ImportedRows   int64                   `json:"importedRows"`
    TotalRows      int64                   `json:"totalRows"`
    Reason         string                  `json:"reason"`
    FileSize       int64                   `json:"fileSize"`
    Details        []*ImportProgressDetail `json:"details"`
}

type ImportProgressDetail struct {
    FileName     string `json:"fileName"`
    FileSize     int64  `json:"fileSize"`
    Progress     int64  `json:"progress"`
    CompleteTime string `json:"completeTime"`
    State        string `json:"state"`
    ImportedRows int64  `json:"importedRows"`
    TotalRows    int64  `json:"totalRows"`
}
```

**参数：**

- **Status** (*int*) -

    继承自 `ResponseBase`。值为 `0` 表示成功。

- **Message** (*string*) -

    继承自 `ResponseBase`。当 `Status` 非零时的错误描述。

- **Data** (&ast;*ImportProgressData*) -

    所请求作业的进度载荷。**ImportProgressData 字段：**。

- **CollectionName** (*string*) -

    该作业所针对的 Collection。

- **JobID** (*string*) -

    导入作业的唯一标识符。

- **State** (*string*) -

    当前作业状态。常见值包括 `Pending`、`Importing`、`Completed` 和 `Failed`。

- **Progress** (*int64*) -

    总体完成百分比，范围为 `[0, 100]`。

- **ImportedRows** (*int64*) -

    已导入 Collection 的行数。

- **TotalRows** (*int64*) -

    所有源文件预期提供的总行数。

- **FileSize** (*int64*) -

    所有源文件的总大小，以字节为单位。

- **CompleteTime** (*string*) -

    作业完成时间戳；在作业达到终态之前为空。

- **Reason** (*string*) -

    当 `State == "Failed"` 时的失败原因；否则为空。

- **Details** (*[]\ImportProgressDetail*) -

    每个文件的进度条目，其结构与父级字段相同，每个条目分别限定于一个源文件。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。失败情况包括选项格式错误、网络问题、未知或已过期的作业 ID，以及通过响应状态报告的服务器端错误。

## 示例\{#example}

演示 GetImportProgress() 的用法。

```go
import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
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
