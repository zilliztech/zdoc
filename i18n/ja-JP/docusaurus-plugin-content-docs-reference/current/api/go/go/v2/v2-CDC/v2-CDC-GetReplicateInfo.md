---
title: "GetReplicateInfo | Go | v2"
slug: /go/go/v2-CDC-GetReplicateInfo
sidebar_label: "GetReplicateInfo"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、強制フェイルオーバー後に使用されるサルベージチェックポイントなど、Milvus クラスターからレプリケーション情報を取得します。 | Go | v2"
type: docx
token: QisddwwM3oTHT8x3No8cKfYNnVb
sidebar_position: 4
keywords: 
  - 密ベクトル
  - 階層型ナビゲーブルスモールワールド
  - 密埋め込み
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetReplicateInfo
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetReplicateInfo

この操作は、強制フェイルオーバー後に使用されるサルベージチェックポイントなど、Milvus クラスターからレプリケーション情報を取得します。

```go
func (c *Client) GetReplicateInfo(ctx context.Context, req *milvuspb.GetReplicateInfoRequest, opts ...grpc.CallOption) (*milvuspb.GetReplicateInfoResponse, error)
```

## リクエスト構文\{#request-syntax}

GetReplicateInfo() のリクエストを作成します。

```go
resp, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
```

**パラメーター：**

- **req** (*milvuspb.GetReplicateInfoRequest*) -

    次のフィールドを持つレプリケーション情報リクエストです。

    - **SourceClusterId** (*string*) -

        ソースクラスターの ID です。

    - **TargetPchannel** (*string*) -

        クエリ対象の物理チャネルです。

- **opts** (*...grpc.CallOption*) -

    任意の gRPC 呼び出しオプションです。

**戻り値の型：**

&ast;*milvuspb.GetReplicateInfoResponse, error*

**戻り値：**

指定したソースクラスターとチャネルのレプリケーション情報です。`resp.GetSalvageCheckpoint()` を使用して、強制フェイルオーバー後に同期されていないメッセージをサルベージするための起点となるチェックポイントを取得します。RPC が失敗した場合はエラーを返します。

**パラメーター：**

- **result** (&ast;*milvuspb.GetReplicateInfoResponse*) -

    GetReplicateInfo() によって返される &ast;milvuspb.GetReplicateInfoResponse の値です。

**エラーハンドリング：**

- **error**

    操作が失敗します。RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

GetReplicateInfo() の使用例を示します。

```go
import (
	"context"

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

resp, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
if err != nil {
	// handle error
}
```
