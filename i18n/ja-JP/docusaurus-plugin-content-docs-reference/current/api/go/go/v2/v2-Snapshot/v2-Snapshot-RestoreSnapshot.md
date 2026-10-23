---
title: "RestoreSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットをターゲットコレクションに復元します。復元は非同期で実行されます。進行状況を監視するには、`GetRestoreSnapshotState()` を使用します。 | Go | v2"
type: docx
token: DrQidTj6koNKBkxHi4NcAxBfnDd
sidebar_position: 10
keywords: 
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - zilliz
  - zilliz cloud
  - クラウド
  - RestoreSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreSnapshot()

この操作は、スナップショットをターゲットコレクションに復元します。復元は非同期で実行されます。進行状況を監視するには、`GetRestoreSnapshotState()` を使用します。

```go
func (c *Client) RestoreSnapshot(ctx context.Context, opt RestoreSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

RestoreSnapshot() のリクエストを作成します。

```go
option := client.NewRestoreSnapshotOption(snapshotName, collectionName, targetCollectionName).
    WithDbName(dbName string).
    WithTargetDbName(targetDbName string)

jobID, err := client.RestoreSnapshot(option)
```

**パラメーター:**

- **name** (*string*) -

    **[REQUIRED]**

    復元するスナップショットの名前です。

- **collectionName** (*string*) -

    **[REQUIRED]**

    スナップショットの取得元であるソースコレクションの名前です。

- **targetCollectionName** (*string*) -

    **[REQUIRED]**

    復元後のコレクションの名前です。ソースコレクションの名前とは異なっている必要があります。

**ビルダーメソッド:**

- `WithDbName(dbName string)`

    ソースデータベース名を設定します。設定しない場合は、デフォルトのデータベースが使用されます。

- `WithTargetDbName(targetDbName string)`

    復元後のコレクションのターゲットデータベース名を設定します。設定しない場合は、ソースデータベースが使用されます。

**戻り値の型:**

*int64, error*

**戻り値:**

復元ジョブ ID です。復元の進行状況を追跡するには、この ID を `GetRestoreSnapshotState()` とともに使用します。スナップショットが存在しない場合、または操作が失敗した場合は、エラーを返します。

**パラメーター:**

- **result** (*int64*) -

    RestoreSnapshot() によって返される int64 値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

RestoreSnapshot() の使用例を示します。

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

option := milvusclient.NewRestoreSnapshotOption("backup_20260418", "my_collection", "restored_collection")

jobID, err := cli.RestoreSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```
