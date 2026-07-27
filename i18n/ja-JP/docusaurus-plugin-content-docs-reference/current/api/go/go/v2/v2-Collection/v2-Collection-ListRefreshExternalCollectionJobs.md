---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべてまたは指定された collection の external collection リフレッシュジョブを一覧表示します。 | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 27
keywords: 
  - ベクトルデータベースはどのように動作するか
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

この操作は、すべてまたは指定された collection の external collection リフレッシュジョブを一覧表示します。

```go
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error) {
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**パラメーター:**

- **collectionName** (*string*) -

    対象 collection の名前です。このパラメーターを指定しない場合、すべての external collection のリフレッシュジョブが返されます。

**戻り値の型:**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**戻り値:**

*entity.RefreshExternalCollectionJobInfo* 構造体のリストです。各要素には、external collection リフレッシュジョブの詳細が記録されています。

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

パラメーター:

**パラメーター:**

- **JobID** (*int64*) -

    現在のリクエストで指定されたジョブ ID です。

- **CollectionName** (*string*) -

    `RefreshExternalCollection()` で指定された external collection の名前です。

- **State** (*string*) -

    指定されたジョブの現在の状態です。可能な値は次のとおりです。

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    指定されたジョブの現在の進行状況です。値は 0 から 100 までの整数です。

- **Reason** (*string*) -

    リフレッシュ操作が失敗した場合のエラープロンプトです。通常時は空文字列です。

- **ExternalSource** (*string*) -

    `RefreshExternalCollection()` で指定された external source URI です。

- **StartTime** (*int64*) -

    指定されたジョブが開始される時点のミリ秒単位のタイムスタンプです。

- **EndTime** (*int64*) -  

    指定されたジョブが終了する時点のミリ秒単位のタイムスタンプです。

## 例\{#example}

```go
// 指定した collection のリフレッシュジョブを一覧表示
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

// すべての external collection のリフレッシュジョブを一覧表示
option = client.NewListRefreshExternalCollectionJobsOption()

result, err = client.ListRefreshExternalCollectionJobs(option)
```
