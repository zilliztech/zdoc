---
title: "GetRestoreSnapshotState() | Go | v2"
slug: /go/go/v2-Snapshot-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、非同期のスナップショット復元ジョブのステータスと進行状況を照会します。 | Go | v2"
type: docx
token: SxMgdp3ThoMYHaxkKtKc9EWvnZd
sidebar_position: 5
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - Faiss
  - zilliz
  - zilliz cloud
  - クラウド
  - GetRestoreSnapshotState()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetRestoreSnapshotState()

この操作は、非同期のスナップショット復元ジョブのステータスと進行状況を照会します。

```go
func (c *Client) GetRestoreSnapshotState(ctx context.Context, opt GetRestoreSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.RestoreSnapshotInfo, error)
```

## リクエスト構文\{#request-syntax}

GetRestoreSnapshotState() のリクエストを作成します。

```go
option := client.NewGetRestoreSnapshotStateOption(jobID)

result, err := client.GetRestoreSnapshotState(option)
```

**パラメーター:**

- **jobID** (*int64*) -

    **[必須]**

    復元ジョブ ID です。

**戻り値の型:**

*milvuspb.RestoreSnapshotInfo, error*

**戻り値:**

指定したスナップショット復元ジョブの詳細を記録する RestoreSnapshotInfo オブジェクトです。

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

**パラメーター:**

- **result** (*milvuspb.RestoreSnapshotInfo*) -

    指定したスナップショット復元ジョブの詳細を記録する RestoreSnapshotInfo オブジェクトです。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

GetRestoreSnapshotState() の使用例を示します。

```go
import (
	"log"
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
