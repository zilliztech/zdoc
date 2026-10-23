---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RefreshExternalCollectionJobInfo インスタンスには、外部コレクションのリフレッシュジョブに関する情報が含まれます。 | Go | v2"
type: docx
token: TxIQdcx34oB2CUxHIRMcRGPNnic
sidebar_position: 34
keywords: 
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - RefreshExternalCollectionJobInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionJobInfo

RefreshExternalCollectionJobInfo インスタンスには、外部コレクションのリフレッシュジョブに関する情報が含まれます。

```go
type RefreshExternalCollectionJobInfo struct {
    JobID int64
    CollectionName string
    State RefreshExternalCollectionState
    Progress int64
    Reason string
    ExternalSource string
    ExternalSpec string
    StartTime int64
    EndTime int64
}
```

**フィールド:**

- **JobID**（*int64*）-

    リフレッシュジョブの一意の識別子です。

- **CollectionName**（*string*）-

    リフレッシュされるコレクションの名前です。

- **State**（[RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)）-

    リフレッシュジョブの現在の状態です。

- **Progress**（*int64*）-

    リフレッシュジョブの進行状況（パーセンテージ）です。

- **Reason**（*string*）-

    現在の状態に関する追加情報または理由です。

- **ExternalSource**（*string*）-

    外部データソースの識別子です。

- **ExternalSpec**（*string*）-

    外部データソースの仕様（JSON）です。ファイル形式とオブジェクトストレージの設定を記述します。

- **StartTime**（*int64*）-

    ジョブが開始された Unix タイムスタンプです。

- **EndTime**（*int64*）-

    ジョブが完了した Unix タイムスタンプです。

## 例\{#example}

RefreshExternalCollectionJobInfo の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

jobs, err := cli.ListRefreshExternalCollectionJobs(ctx, milvusclient.NewListRefreshExternalCollectionJobsOption())
if err != nil {
	// handle error
}
for _, job := range jobs {
	fmt.Println(job.JobID, job.State)
}
```
