---
title: "ListRestoreSnapshotJobs() | Go | v2"
slug: /go/go/v2-Snapshot-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべての復元スナップショットジョブを一覧表示します。必要に応じて、コレクション名またはデータベース名でフィルタリングできます。 | Go | v2"
type: docx
token: QrOmdt65AooKEkxVmNuc7qunnmf
sidebar_position: 6
keywords: 
  - Zilliz
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - ListRestoreSnapshotJobs()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

この操作は、すべての復元スナップショットジョブを一覧表示します。必要に応じて、コレクション名またはデータベース名でフィルタリングできます。

```go
func (c *Client) ListRestoreSnapshotJobs(ctx context.Context, opt ListRestoreSnapshotJobsOption, callOptions ...grpc.CallOption) ([]*milvuspb.RestoreSnapshotInfo, error)
```

## リクエスト構文\{#request-syntax}

ListRestoreSnapshotJobs() のリクエストを作成します。

```go
option := client.NewListRestoreSnapshotJobsOption().
    WithCollectionName(collectionName string).
    WithDbName(dbName string)

result, err := client.ListRestoreSnapshotJobs(option)
```

**パラメーター：**

- **JobId** (*int64*) -

    復元ジョブ ID です。

- **SnapshotName** (*string*) -

    復元対象のスナップショット名です。

- **DbName** (*string*) -

    対象のデータベース名です。

- **CollectionName** (*string*) -

    対象のコレクション名です。

- **State** (*RestoreSnapshotState*) -

    現在の状態です。指定可能な値は *RestoreSnapshotNone*、*RestoreSnapshotPending*、*RestoreSnapshotExecuting*、*RestoreSnapshotCompleted*、*RestoreSnapshotFailed* です。

- **Progress** (*int64*) -

    進捗率（0～100）です。

- **Reason** (*string*) -

    ジョブが失敗した場合のエラー理由です。

- **StartTime** (*int64*) -

    開始タイムスタンプ（ミリ秒）です。

- **TimeCost** (*int64*) -

    所要時間（ミリ秒）です。

**ビルダーメソッド：**

- `WithCollectionName(collectionName string)`

    対象のコレクション名で復元ジョブをフィルタリングします。設定しない場合は、すべての復元ジョブが一覧表示されます。

- `WithDbName(dbName string)`

    データベース名を指定します。設定しない場合は、デフォルトのデータベースが使用されます。

**戻り値の型：**

<em>[]</em>milvuspb.RestoreSnapshotInfo, error&ast;

**戻り値：**

RestoreSnapshotInfo オブジェクトのリストです。各オブジェクトには、復元スナップショットジョブの詳細が記録されます。

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

**パラメーター：**

- **result** (<em>[]</em>milvuspb.RestoreSnapshotInfo&ast;) -

    復元スナップショットジョブの詳細をそれぞれ記録する RestoreSnapshotInfo オブジェクトです。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

ListRestoreSnapshotJobs() の使用例を示します。

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

option := milvusclient.NewListRestoreSnapshotJobsOption()

jobs, err := cli.ListRestoreSnapshotJobs(ctx, option)
if err != nil {
	// handle error
}

for _, job := range jobs {
	fmt.Printf("Job %d: %s -> %s (%s)\n", job.GetJobId(), job.GetSnapshotName(), job.GetCollectionName(), job.GetState())
}
```
