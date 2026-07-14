---
title: "GetRestoreSnapshotState() | Go | v2"
slug: /go/go/v2-Snapshot-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、非同期の restore snapshot ジョブのステータスと進行状況を照会します。 | Go | v2"
type: docx
token: SxMgdp3ThoMYHaxkKtKc9EWvnZd
sidebar_position: 4
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - GetRestoreSnapshotState()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetRestoreSnapshotState()

この操作は、非同期の restore snapshot ジョブのステータスと進行状況を照会します。

```go
func (c *Client) GetRestoreSnapshotState(ctx context.Context, opt GetRestoreSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.RestoreSnapshotInfo, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewGetRestoreSnapshotStateOption(jobID)

result, err := client.GetRestoreSnapshotState(option)
```

**パラメータ:**

- **JobId** (*int64*) -

    `RestoreSnapshot()` によって返されるジョブ ID。

**戻り値の型:**

*milvuspb.RestoreSnapshotInfo, error*

**戻り値:**

指定された restore snapshot ジョブの詳細を記録する RestoreSnapshotInfo オブジェクト。

```go
type RestoreSnapshotInfo struct {
    JobId          int64
    SnapshotName   string
    DbName         string
    CollectionName string
    State          RestoreSnapshotState
    Progress       int64
    Reason         string
    StartTime      int64
    TimeCost       int64
}
```

**パラメータ:**

- **jobID** (*int64*)

    restore ジョブ ID。

- **SnapshotName** (*string*) -

    restore 中の snapshot 名。

- **DbName** (*string*) -

    対象データベース名。

- **CollectionName** (*string*) -

    対象 collection 名。

- **State** (*RestoreSnapshotState*) -

    現在の状態。指定可能な値: *RestoreSnapshotNone*, *RestoreSnapshotPending*, *RestoreSnapshotExecuting*, *RestoreSnapshotCompleted*, *RestoreSnapshotFailed*。

- **Progress** (*int64*) -

    進捗率（0～100）。

- **Reason** (*string*) -

    ジョブが失敗した場合のエラー理由。

- **StartTime** (*int64*) -

    開始タイムスタンプ（ミリ秒）。

- **TimeCost** (*int64*) -

    所要時間（ミリ秒）。

**例外:**

- **error**

    失敗の詳細は err != nil を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewGetRestoreSnapshotStateOption(12345)

info, err := cli.GetRestoreSnapshotState(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(info.GetState())
fmt.Println(info.GetProgress())
```
