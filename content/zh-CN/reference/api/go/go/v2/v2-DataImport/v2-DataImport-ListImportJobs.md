---
title: "ListImportJobs() | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobs
sidebar_label: "ListImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数通过 RESTful API 列出指定 Collection 的批量导入作业。您可以使用它监控进行中和已完成的导入作业，对作业历史记录进行分页，或按 Collection 名称筛选。响应中的每条记录都包含作业 ID、当前状态、进度百分比以及失败原因（如有）。 | Go | v2"
type: docx
token: YmqKdQyDDo2Yyjx5rkMcQBGvnEg
sidebar_position: 7
keywords: 
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - zilliz
  - zilliz cloud
  - 云
  - ListImportJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs()

此函数通过 RESTful API 列出指定 Collection 的批量导入作业。您可以使用它监控进行中和已完成的导入作业，对作业历史记录进行分页，或按 Collection 名称筛选。响应中的每条记录都包含作业 ID、当前状态、进度百分比以及失败原因（如有）。

<Admonition type="info" icon="📘" title="Notes">

`ListImportJobs()` 是 `github.com/milvus-io/milvus/client/v2/bulkwriter` 中的包级函数。它调用 REST `/v2/vectordb/jobs/import/list` Endpoint，并同时适用于 Milvus 开源集群和 Zilliz Cloud。

</Admonition>

```go
func ListImportJobs(ctx context.Context, option *ListImportJobsOption) (*ListImportJobsResponse, error)
```

## 请求语法\{#request-syntax}

```go
option := bulkwriter.NewListImportJobsOption(uri, collectionName).
    WithAPIKey(apiKey).
    WithPageSize(pageSize).
    WithCurrentPage(currentPage)

resp, err := bulkwriter.ListImportJobs(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -<br/>
  用于取消和截止时间控制的上下文。HTTP 请求会继承此上下文，因此取消它会中止正在进行中的调用。

- **option** (*ListImportJobsOption*) -<br/>
  使用 `NewListImportJobsOption()` 创建的列表选项。如果未通过 `WithCurrentPage()` 或 `WithPageSize()` 修改，则默认值为 `CurrentPage: 1, PageSize: 10`。必填。

**返回类型：**

*\*ListImportJobsResponse, error*

**返回值：**

返回一个 `ListImportJobsResponse`，其 `Data.Records` 切片包含每个作业对应的一个 `ImportJobRecord`，其中包括作业 ID、状态和进度。如果请求无法封送、HTTP 调用失败，或者服务器返回非零状态，则返回错误。

**异常：**

- **error**

    请检查 `err != nil` 以获取失败详情。失败情况包括格式错误的选项、网络问题、身份验证错误，以及通过响应状态报告的服务器端错误。

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
