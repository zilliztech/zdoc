---
title: "GetRefreshExternalCollectionProgress() | Go | v2"
slug: /go/go/v2-Collection-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回指定外部 Collection 刷新作业的进度。 | Go | v2"
type: docx
token: OTM3db7aroAXAYxrTy4cyVbwnGG
sidebar_position: 31
keywords: 
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - zilliz
  - zilliz cloud
  - 云
  - GetRefreshExternalCollectionProgress()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

此操作返回指定外部 Collection 刷新作业的进度。

```go
func (c *Client) GetRefreshExternalCollectionProgress(ctx context.Context, option GetRefreshExternalCollectionProgressOption, callOptions ...grpc.CallOption) (*entity.RefreshExternalCollectionJobInfo, error)
```

## 请求语法\{#request-syntax}

为 GetRefreshExternalCollectionProgress() 创建请求。

```go
option := client.NewGetRefreshExternalCollectionProgressOption(jobID)

result, err := client.GetRefreshExternalCollectionProgress(option)
```

**参数：**

- **jobID** （*int64*） -

    **[必需]**

**返回类型：**

&ast;*entity.RefreshExternalCollectionJobInfo*

**返回：**

一个 Entity 结构体类型，用于记录指定外部 Collection 刷新作业的详细信息。

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

**参数：**

- **JobID** （*int64*） -

    刷新作业的唯一标识符。

- **CollectionName** （*string*） -

    正在刷新的 Collection 的名称。

- **State** （[RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)） -

    刷新作业的当前状态。

- **Progress** （*int64*） -

    刷新作业的进度百分比。

- **Reason** （*string*） -

    当前状态的补充信息或原因。

- **ExternalSource** （*string*） -

    外部数据源标识符。

- **ExternalSpec** （*string*） -

    外部数据源规范（JSON），用于描述文件格式和对象存储设置。

- **StartTime** （*int64*） -

    作业开始时的 Unix 时间戳。

- **EndTime** （*int64*） -

    作业完成时的 Unix 时间戳。

**异常处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 GetRefreshExternalCollectionProgress() 的用法。

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))

jobID := refreshResult.JobID

for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))

    fmt.Printf("State: %s\n", progress.State)

    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```
