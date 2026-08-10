---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出全部或指定 Collection 的外部 Collection 刷新作业。 | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 27
keywords: 
  - 向量 Database 如何工作
  - 向量数据库对比
  - openai 向量数据库
  - 自然语言处理 Database
  - zilliz
  - zilliz cloud
  - 云
  - ListRefreshExternalCollectionJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

此操作列出全部或指定 Collection 的外部 Collection 刷新作业。

```go
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error) {
```

## 请求语法\{#request-syntax}

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**参数：**

- **collectionName** (*string*) -

    目标 Collection 的名称。如果未指定此参数，则会返回所有外部 Collection 的刷新作业。

**返回类型：**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**返回值：**

由 *entity.RefreshExternalCollectionJobInfo* 结构体组成的列表，其中每一项都记录一个外部 Collection 刷新作业的详细信息。

```go
type RefreshExternalCollectionJobInfo struct {
    JobID          int64
    CollectionName string
    State          RefreshExternalCollectionState
    Progress       int64
    Reason         string
    ExternalSource string
    StartTime      int64
    EndTime        int64
}
```

参数：

**参数：**

- **JobID** (*int64*) -

    当前请求中指定的作业 ID。

- **CollectionName** (*string*) -

    在 `RefreshExternalCollection()` 中指定的外部 Collection 名称。

- **State** (*string*) -

    指定作业的当前状态。可能的值包括：

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    指定作业的当前进度。该值为 0 到 100 的整数。

- **Reason** (*string*) -

    如果刷新操作失败，则显示错误提示。正常情况下，此值为空字符串。

- **ExternalSource** (*string*) -

    在 `RefreshExternalCollection()` 中指定的外部源 URI。

- **StartTime** (*int64*) -

    指定作业开始时的毫秒级时间戳。

- **EndTime** (*int64*) -  

    指定作业结束时的毫秒级时间戳。

## 示例\{#example}

```go
// List refresh jobs of a specified collection
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

// List refresh jobs of all external collections
option = client.NewListRefreshExternalCollectionJobsOption()

result, err = client.ListRefreshExternalCollectionJobs(option)
```
