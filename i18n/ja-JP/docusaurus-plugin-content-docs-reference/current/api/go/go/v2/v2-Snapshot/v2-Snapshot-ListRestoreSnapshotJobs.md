---
title: "ListRestoreSnapshotJobs() | Go | v2"
slug: /go/go/v2-Snapshot-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての復元スナップショットジョブを一覧表示します。必要に応じて collection 名またはデータベース名でフィルタリングできます。 | Go | v2"
type: docx
token: QrOmdt65AooKEkxVmNuc7qunnmf
sidebar_position: 5
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - ListRestoreSnapshotJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

この操作は、すべての復元スナップショットジョブを一覧表示します。必要に応じて collection 名またはデータベース名でフィルタリングできます。

```go
func (c *Client) ListRestoreSnapshotJobs(ctx context.Context, opt ListRestoreSnapshotJobsOption, callOptions ...grpc.CallOption) ([]*milvuspb.RestoreSnapshotInfo, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewListRestoreSnapshotJobsOption().
    WithCollectionName(collectionName string).
    WithDbName(dbName string)

result, err := client.ListRestoreSnapshotJobs(option)
```

**ビルダーメソッド:**

- `WithCollectionName(collectionName string)`

    これにより、対象の collection 名で復元ジョブをフィルタリングします。設定しない場合、すべての復元ジョブが一覧表示されます。

- `WithDbName(dbName string)`

    これにより、データベース名を指定します。設定しない場合、デフォルトのデータベースが使用されます。

**戻り値の型:**

*[]&ast;milvuspb.RestoreSnapshotInfo*, *error*

**戻り値:**

復元スナップショットジョブの詳細を記録する RestoreSnapshotInfo オブジェクトのリストです。

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

- **JobId** (*int64*) -

    復元ジョブ ID。

- **SnapshotName** (*string*) -

    復元中のスナップショット名。

- **DbName** (*string*) -

    対象のデータベース名。

- **CollectionName** (*string*) -

    対象の collection 名。

- **State** (*RestoreSnapshotState*) -

    現在の状態。指定可能な値: *RestoreSnapshotNone*, *RestoreSnapshotPending*, *RestoreSnapshotExecuting*, *RestoreSnapshotCompleted*, *RestoreSnapshotFailed*。

- **Progress** (*int64*) -

    進行率のパーセンテージ (0-100)。

- **Reason** (*string*) -

    ジョブが失敗した場合のエラー理由。

- **StartTime** (*int64*) -

    ミリ秒単位の開始タイムスタンプ。

- **TimeCost** (*int64*) -

    ミリ秒単位の所要時間。

**例外:**

- **error**

    失敗の詳細については err != nil を確認してください。

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

option := milvusclient.NewListRestoreSnapshotJobsOption()

jobs, err := cli.ListRestoreSnapshotJobs(ctx, option)
if err != nil {
	// handle error
}

for _, job := range jobs {
	fmt.Printf("Job %d: %s -> %s (%s)\n", job.GetJobId(), job.GetSnapshotName(), job.GetCollectionName(), job.GetState())
}
```
