---
title: "GetRefreshExternalCollectionProgress() | Go | v2"
slug: /go/go/v2-Collection-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された外部コレクションのリフレッシュジョブの進行状況を返します。 | Go | v2"
type: docx
token: OTM3db7aroAXAYxrTy4cyVbwnGG
sidebar_position: 25
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - オーディオ検索
  - zilliz
  - zilliz cloud
  - クラウド
  - GetRefreshExternalCollectionProgress()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

この操作は、指定された外部コレクションのリフレッシュジョブの進行状況を返します。

```go
func (c *Client) GetRefreshExternalCollectionProgress(ctx context.Context, option GetRefreshExternalCollectionProgressOption, callOptions ...grpc.CallOption) (*entity.RefreshExternalCollectionJobInfo, error)
```

## Request Syntax\{#request-syntax}

```go
option := client.NewGetRefreshExternalCollectionProgressOption(jobID)

result, err := client.GetRefreshExternalCollectionProgress(option)
```

**PARAMETERS:**

- **jobID** (*int64*) -

    `refresh_external_collection()` によって返されるジョブ ID。

**RETURN TYPE:**

*&ast;entity.RefreshExternalCollectionJobInfo*

**RETURNS:**

指定された外部コレクションのリフレッシュジョブの詳細を記録する struct 型です。

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

PARAMETERS:

**PARAMETERS:**

- **JobID** (*int64*) -

    現在のリクエストで指定されたジョブ ID。

- **CollectionName** (*string*) -

    `RefreshExternalCollection()` で指定された外部コレクションの名前。

- **State** (*string*) -

    指定されたジョブの現在の状態。指定可能な値は次のとおりです。

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    指定されたジョブの現在の進行状況。値は 0 から 100 までの整数です。

- **Reason** (*string*) -

    リフレッシュ操作が失敗した場合のエラーメッセージです。通常時は空文字列です。

- **ExternalSource** (*string*) -

    `RefreshExternalCollection()` で指定された外部ソース URI。

- **StartTime** (*int64*) -

    指定されたジョブが開始された時刻のミリ秒タイムスタンプ。

- **EndTime** (*int64*) -  

    指定されたジョブが終了した時刻のミリ秒タイムスタンプ。

## Examples:\{#examples}

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
