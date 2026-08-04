---
title: "ListImportJobsOption | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsOption
sidebar_label: "ListImportJobsOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类型用于配置通过 RESTful API 列出集合批量导入任务的请求。使用 `NewListImportJobsOption()` 构造，默认值为 `CurrentPage: 1, PageSize: 10`。可链式调用 `With` 构建器方法来更改分页、添加 API 密钥或覆盖默认值。 | Go | v2"
type: docx
token: KUFtdKbFpoTdtkxw4y3cYWhHnUe
sidebar_position: 8
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobsOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsOption

此类型用于配置通过 RESTful API 列出集合批量导入任务的请求。使用 `NewListImportJobsOption()` 构造，默认值为 `CurrentPage: 1, PageSize: 10`。可链式调用 `With*` 构建器方法来更改分页、添加 API 密钥或覆盖默认值。

```go
type ListImportJobsOption struct {
    URL            string
    CollectionName string
    ClusterID      string
    APIKey         string
    PageSize       int
    CurrentPage    int
}
```

**字段：**

- **URL** (*string*) -<br/>
  Milvus 或 Zilliz Cloud 集群的基础 URL。不要包含路径；函数会自动追加 `/v2/vectordb/jobs/import/list`。

- **CollectionName** (*string*) -<br/>
  要列出其导入任务的集合名称。必填。

- **ClusterID** (*string*) -<br/>
  Zilliz Cloud 集群 ID。可选；仅用于云导入。

- **APIKey** (*string*) -<br/>
  作为 `Bearer` 请求头发送的授权令牌。可选；当服务器强制执行基于令牌的身份验证时为必需。

- **PageSize** (*int*) -<br/>
  每页返回的任务数量。默认值为 `10`。使用 `WithPageSize()` 覆盖。

- **CurrentPage** (*int*) -<br/>
  页码索引，从 `1` 开始。默认值为 `1`。使用 `WithCurrentPage()` 覆盖。

**构建器方法：**

- `WithAPIKey(key string)`<br/>
  设置作为 `Bearer` 请求头发送的授权令牌。

- `WithPageSize(pageSize int)`<br/>
  设置每页返回的任务数量。

- `WithCurrentPage(currentPage int)`<br/>
  设置页码索引，从 `1` 开始。

**构造函数：**

- `NewListImportJobsOption(uri string, collectionName string)`

    创建一个带有合理默认值的 ListImportJobsOption（`CurrentPage: 1, PageSize: 10`）。
