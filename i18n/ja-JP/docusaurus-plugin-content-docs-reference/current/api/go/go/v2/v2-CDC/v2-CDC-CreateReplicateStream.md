---
title: "CreateReplicateStream | Go | v2"
slug: /go/go/v2-CDC-CreateReplicateStream
sidebar_label: "CreateReplicateStream"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、レプリケーションメッセージを送信するためのレプリケーションストリームを作成します。 | Go | v2"
type: docx
token: VUXQdmaliopQf9xzORCcEe3YntZ
sidebar_position: 1
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - LLM-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateReplicateStream
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateReplicateStream

この操作では、レプリケーションメッセージを送信するためのレプリケーションストリームを作成します。

<Admonition type="info" title="Notes">

このインターフェースは v3.0.0 で非推奨です。Milvus の操作ではなく、生の gRPC ストリームハンドルを返します。

</Admonition>

```go
func (c *Client) CreateReplicateStream(ctx context.Context, opts ...grpc.CallOption) (milvuspb.MilvusService_CreateReplicateStreamClient, error)
```

## リクエスト構文\{#request-syntax}

CreateReplicateStream() のリクエストを作成します。

```go
stream, err := cli.CreateReplicateStream(ctx)
```

**パラメーター:**

- **opts** (*...grpc.CallOption*) -

    省略可能な gRPC 呼び出しオプションです。

**戻り値の型:**

*milvuspb.MilvusService_CreateReplicateStreamClient, error*

**戻り値:**

双方向のレプリケーションストリームです。`stream.Send(...)` を使用して `milvuspb.ReplicateMessage` フレームを送信し、`stream.Recv()` を使用して応答を受信します。完了したら、`stream.CloseSend()` で送信側を閉じます。ストリームを作成できない場合は、エラーを返します。

**パラメーター:**

- **result** (*milvuspb.MilvusService_CreateReplicateStreamClient*) -

    CreateReplicateStream() から返される milvuspb.MilvusService_CreateReplicateStreamClient の値です。

**エラー処理:**

- **error**

    操作は失敗します。ストリームを作成できません。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

CreateReplicateStream() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

stream, err := cli.CreateReplicateStream(ctx)
if err != nil {
	// handle error
}
defer stream.CloseSend()
```
