---
title: "PinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションのスナップショットデータをピン留めし、ガベージコレクションされないようにします。後でデータのピン留めを解除するために使用できるピン ID を返します。 | Go | v2"
type: docx
token: HmEkdVsmRoc2TbxEjtkcKChfnEf
sidebar_position: 7
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - milvus とは
  - zilliz
  - zilliz cloud
  - cloud
  - PinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

この操作はコレクションのスナップショットデータをピン留めし、ガベージコレクションされないようにします。後でデータのピン留めを解除するために使用できるピン ID を返します。

```go
func (c *Client) PinSnapshotData(ctx context.Context, opt PinSnapshotDataOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewPinSnapshotDataOption("my_snapshot", "my_collection").
    WithDbName("my_db").
    WithTTL(3600)

pinID, err := cli.PinSnapshotData(ctx, option)
```

**パラメータ:**

- **opt** (*PinSnapshotDataOption*) -

    スナップショットデータをピン留めするためのオプションです。

**ビルダーメソッド:**

- `NewPinSnapshotDataOption(name string, collectionName string)`<br/>
  指定したコレクションのスナップショットデータをピン留めするオプションを作成します。

- `WithDbName(dbName string)`<br/>
  コレクションのデータベース名を設定します。

- `WithTTL(ttlSeconds int64)`<br/>
  ピンの有効期限を秒単位で設定します。

**戻り値の型:**

*int64, error*

**戻り値:**

成功した場合はピン ID、操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
