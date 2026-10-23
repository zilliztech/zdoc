---
title: "CreateSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのポイントインタイムスナップショットを作成します。スナップショットを使用して、災害復旧や移行のためにコレクションのデータとメタデータをバックアップします。 | Go | v2"
type: docx
token: QFxmdtUNVoy071xXO8Acvkdpnse
sidebar_position: 1
keywords: 
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

この操作は、コレクションのポイントインタイムスナップショットを作成します。スナップショットを使用して、災害復旧や移行のためにコレクションのデータとメタデータをバックアップします。

```go
func (c *Client) CreateSnapshot(ctx context.Context, opt CreateSnapshotOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreateSnapshot() のリクエストを作成します。

```go
option := client.NewCreateSnapshotOption(snapshotName, collectionName).
    WithDescription(description string).
    WithDbName(dbName string)

err := client.CreateSnapshot(option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    作成するスナップショットの名前です。この名前はコレクション内で一意である必要があります。

- **collectionName** (*string*) -

    **[必須]**

    スナップショットを作成するコレクションの名前です。

**ビルダーメソッド:**

- `WithDescription(description string)`

    スナップショットに任意の人間が読める説明を設定します。

- `WithDbName(dbName string)`

    データベース名を設定します。設定しない場合は、デフォルトのデータベースが使用されます。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返します。コレクションが存在しない場合、スナップショット名がすでに使用されている場合、またはその他の理由で操作が失敗した場合は、エラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細は err != nil を確認してください。

## 例\{#example}

CreateSnapshot() の使用例を示します。

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

option := milvusclient.NewCreateSnapshotOption("backup_20260418", "my_collection").
	WithDescription("Daily backup before schema change")

err = cli.CreateSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println("Snapshot created successfully")
```
