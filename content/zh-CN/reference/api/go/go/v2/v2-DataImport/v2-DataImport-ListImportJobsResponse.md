---
title: "ListImportJobsResponse | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsResponse
sidebar_label: "ListImportJobsResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`ListImportJobs()` 包函数返回的响应由此类表示。它嵌入了 `ResponseBase` 用于状态字段，并通过嵌套的 `ListImportJobData` 结构体公开分页任务列表。`Data.Records` 中的每个条目都是一个 `ImportJobRecord`，用于描述一个批量导入任务。 | Go | v2"
type: docx
token: C6WkdFvLuon9i8xlu3FcomiDn0b
sidebar_position: 9
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobsResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsResponse

此类表示 `ListImportJobs()` 包函数返回的响应。它嵌入了 `ResponseBase` 用于状态字段，并通过嵌套的 `ListImportJobData` 结构体公开分页任务列表。`Data.Records` 中的每个条目都是一个 `ImportJobRecord`，用于描述一个批量导入任务。

```go
type ListImportJobsResponse struct {
    ResponseBase
    Data *ListImportJobData `json:"data"`
}

type ListImportJobData struct {
    Records []*ImportJobRecord `json:"records"`
}

type ImportJobRecord struct {
    JobID          string `json:"jobId"`
    CollectionName string `json:"collectionName"`
    State          string `json:"state"`
    Progress       int64  `json:"progress"`
    Reason         string `json:"reason"`
}
```

**字段：**

- **Status** (*int*) -<br/>
  继承自 `ResponseBase`。值为 `0` 表示成功。

- **Message** (*string*) -<br/>
  继承自 `ResponseBase`。当 `Status` 非零时，表示错误描述。

- **Data.Records** (*[]\*ImportJobRecord*) -<br/>
  当前页返回的任务记录切片。当没有任务匹配筛选条件时，可能为空。

**ImportJobRecord 字段：**

- **JobID** (*string*) -<br/>
  导入任务的唯一标识符。

- **CollectionName** (*string*) -<br/>
  该任务所针对的集合。

- **State** (*string*) -<br/>
  当前任务状态。常见值包括 `Pending`、`Importing`、`Completed` 和 `Failed`。

- **Progress** (*int64*) -<br/>
  完成百分比，范围为 `[0, 100]`。

- **Reason** (*string*) -<br/>
  当 `State == "Failed"` 时的失败原因；否则为空。

