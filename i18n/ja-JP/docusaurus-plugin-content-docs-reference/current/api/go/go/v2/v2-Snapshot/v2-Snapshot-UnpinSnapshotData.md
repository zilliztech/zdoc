---
title: "UnpinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、以前に pin された snapshot data の pin を解除し、ガベージコレクションの対象にできるようにします。 | Go | v2"
type: docx
token: NgKmd79aSob0ruxRuUEcZba7nge
sidebar_position: 9
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - UnpinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

この操作は、以前に pin された snapshot data の pin を解除し、ガベージコレクションの対象にできるようにします。

```go
func (c *Client) UnpinSnapshotData(ctx context.Context, opt UnpinSnapshotDataOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewUnpinSnapshotDataOption(pinID)

err := cli.UnpinSnapshotData(ctx, option)
```

**パラメータ:**

- **opt** (*UnpinSnapshotDataOption*) -

    snapshot data の pin を解除するためのオプションです。

**ビルダーメソッド:**

- `NewUnpinSnapshotDataOption(pinID int64)`

    これは、`PinSnapshotData()` によって返された pin ID を使用して snapshot data の pin を解除するオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、操作が失敗した場合は error を返します。

**例外:**

- **error**

    失敗の詳細は err != nil を確認してください。

## 例\{#example}

```go
import (
	"context"
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

pinID := int64(12345)

err = cli.UnpinSnapshotData(ctx, milvusclient.NewUnpinSnapshotDataOption(pinID))
if err != nil {
	log.Fatal("failed to unpin snapshot data: ", err.Error())
}
```
