---
title: "PinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスナップショットデータをピン留めし、ガベージコレクションされないようにします。後でデータのピン留めを解除するために使用できるピン ID を返します。 | Go | v2"
type: docx
token: HmEkdVsmRoc2TbxEjtkcKChfnEf
sidebar_position: 8
keywords: 
  - milvus データベース
  - milvus ベクトルデータベース
  - Zilliz Cloud
  - milvus とは
  - zilliz
  - zilliz cloud
  - クラウド
  - PinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

この操作は、コレクションのスナップショットデータをピン留めし、ガベージコレクションされないようにします。後でデータのピン留めを解除するために使用できるピン ID を返します。

```go
func (c *Client) PinSnapshotData(ctx context.Context, opt PinSnapshotDataOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

PinSnapshotData() のリクエストを作成します。

```go
option := milvusclient.NewPinSnapshotDataOption("my_snapshot", "my_collection").
    WithDbName("my_db").
    WithTTL(3600)

pinID, err := cli.PinSnapshotData(ctx, option)
```

**パラメーター:**

- **name**（*string*） -

    **[必須]**

    作成するコレクションの名前。

- **collectionName**（*string*） -

    **[必須]**

    対象コレクションの名前。

**ビルダーメソッド:**

- `NewPinSnapshotDataOption(name string, collectionName string)`

    指定したコレクションのスナップショットデータをピン留めするためのオプションを作成します。

- `WithDbName(dbName string)`

    コレクションのデータベース名を設定します。

- `WithTTL(ttlSeconds int64)`

    ピンの Time-to-Live（TTL）を秒単位で設定します。

**戻り値の型:**

*int64, error*

**戻り値:**

成功した場合はピン ID を返し、操作が失敗した場合はエラーを返します。

**パラメーター:**

- **result**（*int64*） -

    PinSnapshotData() が返す int64 の値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

PinSnapshotData() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

pinID, err := cli.PinSnapshotData(ctx, milvusclient.NewPinSnapshotDataOption("my_snapshot", "quick_setup"))
if err != nil {
	log.Fatal("failed to pin snapshot data: ", err.Error())
}

fmt.Println("Pin ID:", pinID)
```
