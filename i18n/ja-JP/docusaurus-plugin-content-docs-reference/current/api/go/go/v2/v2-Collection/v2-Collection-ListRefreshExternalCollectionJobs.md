---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべてまたは指定された collection の external collection refresh job を一覧表示します。 | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 27
keywords: 
  - ベクトルデータベースはどのように動作するか
  - ベクトル db 比較
  - openai ベクトル db
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - ListRefreshExternalCollectionJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

この操作は、すべてまたは指定された collection の external collection refresh job を一覧表示します。

```go
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error) {
```

## Request Syntax\{#request-syntax}

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    対象 collection の名前です。このパラメータを指定しない場合、すべての external collection の refresh job が返されます。

**RETURN TYPE:**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**RETURNS:**

*entity.RefreshExternalCollectionJobInfo* 構造体のリストを返します。各要素には、external collection refresh job の詳細が記録されています。

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

    現在のリクエストで指定された job ID です。

- **CollectionName** (*string*) -

    `RefreshExternalCollection()` で指定された external collection の名前です。

- **State** (*string*) -

    指定された job の現在の状態です。指定可能な値は次のとおりです。

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    指定された job の現在の進行状況です。値は 0 から 100 までの整数です。

- **Reason** (*string*) -

    refresh 操作が失敗した場合のエラーメッセージです。通常は空文字列です。

- **ExternalSource** (*string*) -

    `RefreshExternalCollection()` で指定された external source URI です。

- **StartTime** (*int64*) -

    指定された job が開始された時点のミリ秒単位のタイムスタンプです。

- **EndTime** (*int64*) -  

    指定された job が終了した時点のミリ秒単位のタイムスタンプです。

## Example\{#example}

```go
// List refresh jobs of a specified collection
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

// List refresh jobs of all external collections
option = client.NewListRefreshExternalCollectionJobsOption()

result, err = client.ListRefreshExternalCollectionJobs(option)
```
