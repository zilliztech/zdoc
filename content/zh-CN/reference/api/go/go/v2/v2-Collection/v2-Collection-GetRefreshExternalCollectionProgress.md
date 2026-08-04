---
title: "GetRefreshExternalCollectionProgress() | Go | v2"
slug: /go/go/v2-Collection-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回指定外部集合刷新任务的进度。 | Go | v2"
type: docx
token: OTM3db7aroAXAYxrTy4cyVbwnGG
sidebar_position: 26
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - GetRefreshExternalCollectionProgress()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

此操作返回指定外部集合刷新任务的进度。

```go
func (c *Client) GetRefreshExternalCollectionProgress(ctx context.Context, option GetRefreshExternalCollectionProgressOption, callOptions ...grpc.CallOption) (*entity.RefreshExternalCollectionJobInfo, error)
```

## 请求语法\{#request-syntax}

```go
option := client.NewGetRefreshExternalCollectionProgressOption(jobID)

result, err := client.GetRefreshExternalCollectionProgress(option)
```

**参数：**

- **jobID** (*int64*) -

    由 `refresh_external_collection()` 返回的任务 ID。

**返回类型：**

*&ast;entity.RefreshExternalCollectionJobInfo*

**返回：**

一个记录指定外部集合刷新任务详细信息的结构体类型。

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

    当前请求中指定的任务 ID。

- **CollectionName** (*string*) -

    在 `RefreshExternalCollection()` 中指定的外部集合名称。

- **State** (*string*) -

    指定任务的当前状态。可能的值包括：

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    指定任务的当前进度。该值为 0 到 100 之间的整数。

- **Reason** (*string*) -

    如果刷新操作失败，则为错误提示。在正常情况下，该值为空字符串。

- **ExternalSource** (*string*) -

    在 `RefreshExternalCollection()` 中指定的外部源 URI。

- **StartTime** (*int64*) -

    指定任务开始时的毫秒级时间戳。

- **EndTime** (*int64*) -  

    指定任务结束时的毫秒级时间戳。

## 示例：\{#examples}

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
