---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有或指定集合的外部集合刷新作业。 | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 27
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - ListRefreshExternalCollectionJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

此操作列出所有或指定集合的外部集合刷新作业。

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

    目标集合的名称。如果未指定此参数，则返回所有外部集合的刷新作业。

**返回类型：**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**返回：**

一个 *entity.RefreshExternalCollectionJobInfo* 结构体列表，其中每个结构体都记录了一个外部集合刷新作业的详细信息。

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

    在 `RefreshExternalCollection()` 中指定的外部集合名称。

- **State** (*string*) -

    指定作业的当前状态。可能的值包括：

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    指定作业的当前进度。该值为 0 到 100 之间的整数。

- **Reason** (*string*) -

    如果刷新操作失败，则为错误提示信息。在正常情况下，该值为空字符串。

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
