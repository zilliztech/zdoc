---
title: "ListImportJobsResponse | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsResponse
sidebar_label: "ListImportJobsResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示由 `ListImportJobs()` 包函数返回的响应。它嵌入了 `ResponseBase` 作为状态字段，并通过嵌套的 `ListImportJobData` 结构体公开分页作业列表。`Data.Records` 中的每个条目都是一个 `ImportJobRecord`，用于描述一个批量导入作业。 | Go | v2"
type: docx
token: C6WkdFvLuon9i8xlu3FcomiDn0b
sidebar_position: 9
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - ListImportJobsResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsResponse

此类表示由 `ListImportJobs()` 包函数返回的响应。它嵌入了 `ResponseBase` 作为状态字段，并通过嵌套的 `ListImportJobData` 结构体公开分页作业列表。`Data.Records` 中的每个条目都是一个 `ImportJobRecord`，用于描述一个批量导入作业。

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
  继承自 `ResponseBase`。当 `Status` 非零时的错误描述。

- **Data.Records** (*[]\*ImportJobRecord*) -<br/>
  为当前页面返回的作业记录切片。当没有作业匹配筛选条件时，可能为空。

**ImportJobRecord 字段：**

- **JobID** (*string*) -<br/>
  导入作业的唯一标识符。

- **CollectionName** (*string*) -<br/>
  该作业所针对的 Collection。

- **State** (*string*) -<br/>
  当前作业状态。常见值包括 `Pending`、`Importing`、`Completed` 和 `Failed`。

- **Progress** (*int64*) -<br/>
  完成百分比，范围为 `[0, 100]`。

- **Reason** (*string*) -<br/>
  当 `State == "Failed"` 时的失败原因；否则为空。

