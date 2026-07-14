---
title: "RestoreSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スナップショットをターゲットコレクションに復元します。復元は非同期で実行されます — 進行状況の監視には `GetRestoreSnapshotState()` を使用します。 | Go | v2"
type: docx
token: DrQidTj6koNKBkxHi4NcAxBfnDd
sidebar_position: 8
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreSnapshot()

この操作は、スナップショットをターゲットコレクションに復元します。復元は非同期で実行されます — 進行状況の監視には `GetRestoreSnapshotState()` を使用します。

```go
func (c *Client) RestoreSnapshot(ctx context.Context, opt RestoreSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewRestoreSnapshotOption(snapshotName, collectionName, targetCollectionName).
    WithDbName(dbName string).
    WithTargetDbName(targetDbName string)

jobID, err := client.RestoreSnapshot(option)
```

**PARAMETERS:**

- **snapshotName** (*string*) -

    復元するスナップショットの名前。

- **collectionName** (*string*) -

    スナップショットの取得元となったソースコレクションの名前。

- **targetCollectionName** (*string*) -

    復元後のコレクションに付ける名前。これはソースコレクション名と異なっている必要があります。

**BUILDER METHODS:**

- `WithDbName(dbName string)`

    ソースデータベース名を設定します。設定しない場合は、デフォルトデータベースが使用されます。

- `WithTargetDbName(targetDbName string)`

    復元後のコレクションのターゲットデータベース名を設定します。設定しない場合は、ソースデータベースが使用されます。

**RETURN TYPE:**

*int64, error*

**RETURNS:**

復元ジョブ ID。`GetRestoreSnapshotState()` とともにこの ID を使用して、復元の進行状況を追跡します。スナップショットが存在しない場合、または操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

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

option := milvusclient.NewRestoreSnapshotOption("backup_20260418", "my_collection", "restored_collection")

jobID, err := cli.RestoreSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```
