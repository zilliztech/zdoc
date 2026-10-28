---
title: "UnpinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: ON REQUEST
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、以前にピン留めされたスナップショットデータのピンを解除し、ガベージコレクションがファイルを回収できるようにします。 | Go | v2"
type: docx
token: NgKmd79aSob0ruxRuUEcZba7nge
sidebar_position: 11
keywords: 
  - Milvus ベンチマーク
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - オープンソースの Milvus
  - zilliz
  - zilliz cloud
  - クラウド
  - UnpinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

この操作は、以前にピン留めされたスナップショットデータのピンを解除し、ガベージコレクションがファイルを回収できるようにします。

```go
func (c *Client) UnpinSnapshotData(ctx context.Context, opt UnpinSnapshotDataOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

UnpinSnapshotData() のリクエストを作成します。

```go
option := milvusclient.NewUnpinSnapshotDataOption(pinID)

err := cli.UnpinSnapshotData(ctx, option)
```

**パラメーター:**

- **pinID** (*int64*) -

    **必須**

    `PinSnapshotData()` によって返されるピン ID です。

**ビルダーメソッド:**

- `NewUnpinSnapshotDataOption(pinID int64)`

    解放するピンの新しいオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、操作が失敗した場合はエラーを返します。

**エラーハンドリング:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

UnpinSnapshotData() の使用方法を示します。

```go
import (
	"context"

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

err = cli.UnpinSnapshotData(ctx, milvusclient.NewUnpinSnapshotDataOption(pinID))
if err != nil {
	// handle error
}
```
