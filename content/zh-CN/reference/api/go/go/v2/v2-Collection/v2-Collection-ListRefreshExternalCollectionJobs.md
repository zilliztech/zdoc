---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有或指定 Collection 的外部 Collection 刷新任务。 | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 32
keywords: 
  - 向量 Database 的工作原理
  - 向量 Database 对比
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListRefreshExternalCollectionJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

此操作会列出所有或指定 Collection 的外部 Collection 刷新任务。

```go
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error)
```

## 请求语法\{#request-syntax}

创建 ListRefreshExternalCollectionJobs() 的请求。

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。如果未指定此参数，则会列出所有外部 Collection 的刷新任务。

**返回类型：**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**返回：**

返回由 *entity.RefreshExternalCollectionJobInfo* 结构体组成的 Entity 列表，其中每个 Entity 记录一个外部 Collection 刷新任务的详细信息。

**参数：**

- **JobID** （*int64*） -

    刷新任务的唯一标识符。

- **CollectionName** （*string*） -

    正在刷新的 Collection 的名称。

- **State** ([RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)) -

    刷新任务的当前状态。

- **Progress** （*int64*） -

    刷新任务的进度百分比。

- **Reason** （*string*） -

    当前状态的附加信息或原因。

- **ExternalSource** （*string*） -

    外部数据源标识符。

- **ExternalSpec** （*string*） -

    外部数据源规范（JSON），描述文件格式和对象存储设置。

- **StartTime** （*int64*） -

    任务开始时的 Unix 时间戳。

- **EndTime** （*int64*） -

    任务完成时的 Unix 时间戳。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 ListRefreshExternalCollectionJobs() 的用法。

```go
// List refresh jobs of a specified collection
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

result, err = client.ListRefreshExternalCollectionJobs(option)
```
