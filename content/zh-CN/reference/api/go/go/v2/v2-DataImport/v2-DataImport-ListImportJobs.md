---
title: "ListImportJobs | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobs
sidebar_label: "ListImportJobs"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 RESTful API 列出指定 Collection 的批量导入任务。您可以使用此操作监控未完成和已完成的导入任务、分页浏览任务历史，或按 Collection 名称进行筛选。响应中的每条记录都包含任务 ID、当前状态、进度百分比以及任何失败原因。 | Go | v2"
type: docx
token: IgHEdnojtokdftxqWfrckpZ1nCg
sidebar_position: 7
keywords: 
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListImportJobs
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs

此操作通过 RESTful API 列出指定 Collection 的批量导入任务。您可以使用此操作监控未完成和已完成的导入任务、分页浏览任务历史，或按 Collection 名称进行筛选。响应中的每条记录都包含任务 ID、当前状态、进度百分比以及任何失败原因。

<Admonition type="info" title="Notes">

`ListImportJobs()` 是 `github.com/milvus-io/milvus/client/v3/bulkwriter` 中的包级函数。它会调用 REST `/v2/vectordb/jobs/import/list` Endpoint，并适用于 Milvus 开源集群和 Zilliz Cloud。

</Admonition>

```go
func ListImportJobs(ctx context.Context, option *ListImportJobsOption) (*ListImportJobsResponse, error)
```

## 请求语法\{#request-syntax}

为 ListImportJobs() 创建请求。

```go
option := bulkwriter.NewListImportJobsOption(uri, collectionName).
    WithAPIKey(apiKey).
    WithPageSize(pageSize).
    WithCurrentPage(currentPage)

resp, err := bulkwriter.ListImportJobs(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -

    用于取消和设置截止时间的上下文。HTTP 请求会继承此上下文，因此取消此上下文会中止正在进行的调用。

- **option** ([ListImportJobsOption](./v2-DataImport-ListImportJobsOption)) -

    使用 `NewListImportJobsOption()` 创建的列表选项。如果未通过 `WithCurrentPage()` 或 `WithPageSize()` 修改，则该值默认为 `CurrentPage: 1, PageSize: 10`。必需。

**构建器方法：**

- `NewListImportJobsOption(uri string, collectionName string)`

    为 ListImportJobs() 创建请求。

**返回类型：**

&ast;*ListImportJobsResponse, error*

**返回：**

返回一个 `ListImportJobsResponse`，其 `Data.Records` 切片为每个任务包含一个 `ImportJobRecord`，其中包括任务 ID、状态和进度。如果请求无法编组、HTTP 调用失败，或服务器返回非零状态，则返回错误。

**参数：**

- **result** (&ast;*ListImportJobsResponse*) -

    ListImportJobs() 返回的 &ast;ListImportJobsResponse 值。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。失败包括格式错误的选项、网络问题、身份验证错误，以及通过响应状态报告的服务器端错误。

## 示例\{#example}

演示 ListImportJobs() 的用法。

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

option := bulkwriter.NewListImportJobsOption(milvusAddr, collectionName).
	WithAPIKey("YOUR_CLUSTER_TOKEN").
	WithPageSize(20).
	WithCurrentPage(1)

resp, err := bulkwriter.ListImportJobs(ctx, option)
if err != nil {
	log.Fatal(err)
}

for _, job := range resp.Data.Records {
	fmt.Printf("%s\t%s\t%d%%\n", job.JobID, job.State, job.Progress)
}
```
