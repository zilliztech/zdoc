---
title: "DumpMessages | Go | v2"
slug: /go/go/v2-CDC-DumpMessages
sidebar_label: "DumpMessages"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データサルベージのために WAL 範囲からメッセージをストリーミングします。通常、強制フェイルオーバー後に `GetReplicateInfo` からサルベージチェックポイントを取得し、そのメッセージ ID をリクエストの `StartMessageId` として渡して、まだ同期されていないメッセージを復元する場合に使用します。 | Go | v2"
type: docx
token: WytGd4yWxo2UfcxPlckcQcR5nWf
sidebar_position: 2
keywords: 
  - Dense embedding
  - Faiss ベクトル データベース
  - Chroma ベクトル データベース
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - DumpMessages
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DumpMessages

この操作は、データサルベージのために WAL 範囲からメッセージをストリーミングします。通常、強制フェイルオーバー後に使用します。`GetReplicateInfo` からサルベージチェックポイントを取得し、そのメッセージ ID をリクエストの `StartMessageId` として渡して、まだ同期されていないメッセージを復元します。

```go
func (c *Client) DumpMessages(ctx context.Context, req *milvuspb.DumpMessagesRequest, opts ...grpc.CallOption) (milvuspb.MilvusService_DumpMessagesClient, error)
```

## リクエスト構文\{#request-syntax}

DumpMessages() のリクエストを作成します。

```go
stream, err := cli.DumpMessages(ctx, &milvuspb.DumpMessagesRequest{
	Pchannel:       ckpt.GetPchannel(),
	StartMessageId: ckpt.GetMessageId(),
	StartTimetick:  ckpt.GetTimeTick(),
})
```

**パラメーター：**

- **req** (*milvuspb.DumpMessagesRequest*) -

    次のフィールドを持つダンプメッセージリクエストです。

    - **Pchannel** (*string*) -

        メッセージをダンプする物理チャネルです。

    - **StartMessageId** (*[]byte*) -

        ダンプを開始するメッセージ ID です。通常は GetReplicateInfo() から取得したサルベージチェックポイントです。

    - **StartTimetick** (*uint64*) -

        ダンプ対象期間の開始タイムティックです。

    - **EndTimetick** (*uint64*) -

        ダンプ対象期間の終了タイムティックです。

- **opts** (*...grpc.CallOption*) -

    任意の gRPC 呼び出しオプションです。

**戻り値の型：**

*milvuspb.MilvusService_DumpMessagesClient, error*

**戻り値：**

サーバーストリーミングクライアントです。`stream.Recv()` によって生成される各フレームは、エラーステータスまたは非システムメッセージのいずれかを含む `DumpMessagesResponse` です。`io.EOF` に達するまで `stream.Recv()` で反復処理します。ストリームを作成できない場合は、エラーを返します。

**パラメーター：**

- **result** (*milvuspb.MilvusService_DumpMessagesClient*) -

    DumpMessages() によって返される milvuspb.MilvusService_DumpMessagesClient の値です。

**エラーハンドリング：**

- **error**

    操作が失敗します。ストリームを作成できません。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

DumpMessages() の使用例を示します。

```go
import (
	"context"
	"io"

	"github.com/milvus-io/milvus-proto/go-api/v3/milvuspb"
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

info, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
if err != nil {
	// handle error
}
ckpt := info.GetSalvageCheckpoint()
if ckpt == nil {
	// no salvage checkpoint available
}

stream, err := cli.DumpMessages(ctx, &milvuspb.DumpMessagesRequest{
	Pchannel:       ckpt.GetPchannel(),
	StartMessageId: ckpt.GetMessageId(),
	StartTimetick:  ckpt.GetTimeTick(),
})
if err != nil {
	// handle error
}

for {
	resp, err := stream.Recv()
	if err == io.EOF {
		break
	}
	if err != nil {
		// handle error
	}
	if msg := resp.GetMessage(); msg != nil {
		// process dumped message
	} else if status := resp.GetStatus(); status != nil {
		// handle error status
		break
	}
}
```
