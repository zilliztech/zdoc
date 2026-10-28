---
title: "RestoreExternalSnapshot | Go | v2"
slug: /go/go/v2-Snapshot-RestoreExternalSnapshot
sidebar_label: "RestoreExternalSnapshot"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、外部スナップショットをターゲットコレクションに復元します。復元は非同期で実行されます — 進行状況の監視には `GetRestoreSnapshotState()` を使用します。 | Go | v2"
type: docx
token: HSYWdB6MaoyG2vxEpMSca16fnsb
sidebar_position: 9
keywords: 
  - プライベート LLM
  - 最近傍検索
  - LLM 評価
  - スパースと密ベクトル
  - zilliz
  - zilliz cloud
  - クラウド
  - RestoreExternalSnapshot
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RestoreExternalSnapshot

この操作は、外部スナップショットをターゲットコレクションに復元します。復元は非同期で実行されます — 進行状況の監視には `GetRestoreSnapshotState()` を使用します。

```go
func (c *Client) RestoreExternalSnapshot(ctx context.Context, opt RestoreExternalSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

RestoreExternalSnapshot() のリクエストを作成します。

```go
option := milvusclient.NewRestoreExternalSnapshotOption(targetCollectionName, snapshotMetadataURI).
    WithDbName(dbName).
    WithExternalSpec(externalSpec).
    WithRequestTimeout(timeout)

jobID, err := cli.RestoreExternalSnapshot(ctx, option)
```

**パラメーター:**

- **targetCollectionName** (*string*) -

    **[必須]**

    復元先のターゲットコレクションの名前です。

- **snapshotMetadataURI** (*string*) -

    **[必須]**

    復元するスナップショットメタデータの URI です。

**ビルダーメソッド:**

- `NewRestoreExternalSnapshotOption(targetCollectionName string, snapshotMetadataURI string)`

    外部スナップショットを復元するための新しいオプションを作成します。

- `WithDbName(dbName string)`

    ターゲットコレクションのデータベース名を設定します。

- `WithExternalSpec(externalSpec string)`

    復元に使用する外部ストレージの仕様（カスタムエンドポイントの認証情報など）を設定します。

- `WithRequestTimeout(timeout time.Duration)`

    復元リクエストのタイムアウトを設定します。デフォルト: `120 * time.Second`。

**戻り値の型:**

*int64, error*

**戻り値:**

成功した場合は復元ジョブ ID を返します。この ID を `GetRestoreSnapshotState()` とともに使用して、復元の進行状況を追跡します。操作が失敗した場合はエラーを返します。

**パラメーター:**

- **result** (*int64*) -

    RestoreExternalSnapshot() によって返される int64 値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RestoreExternalSnapshot() の使用例を示します。

```go
import (
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
	// handle error
}

defer cli.Close(ctx)

jobID, err := cli.RestoreExternalSnapshot(ctx, milvusclient.NewRestoreExternalSnapshotOption("restored_collection", "s3://my-bucket/snapshots/backup/"))
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```
