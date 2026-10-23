---
title: "DropSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DropSnapshot
sidebar_label: "DropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、スナップショットを完全に削除します。削除後は、スナップショットデータを復元できません。 | Go | v2"
type: docx
token: YP0vdMHw9oDlrcxjvg0cihgSnJb
sidebar_position: 3
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - DropSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropSnapshot()

この操作では、スナップショットを完全に削除します。削除後は、スナップショットデータを復元できません。

```go
func (c *Client) DropSnapshot(ctx context.Context, opt DropSnapshotOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropSnapshot() のリクエストを作成します。

```go
option := client.NewDropSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

err := client.DropSnapshot(option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    削除するスナップショットの名前です。

- **collectionName** (*string*) -

    **[必須]**

    スナップショットの属するコレクションの名前です。

**ビルダーメソッド:**

- `WithDbName(dbName string)`

    指定したコレクションが属するデータベースの名前を設定します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返します。スナップショットが存在しない場合、または操作に失敗した場合は、エラーを返します。

**エラーハンドリング:**

- **error**

    操作に失敗しました。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

DropSnapshot() の使用例を示します。

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

option := milvusclient.NewDropSnapshotOption("backup_20260401", "my_collection")

err = cli.DropSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println("Snapshot dropped successfully")
```
