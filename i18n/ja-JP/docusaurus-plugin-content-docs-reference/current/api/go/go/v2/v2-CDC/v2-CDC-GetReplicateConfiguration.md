---
title: "GetReplicateConfiguration | Go | v2"
slug: /go/go/v2-CDC-GetReplicateConfiguration
sidebar_label: "GetReplicateConfiguration"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus クラスターから現在のレプリケーション構成を取得します。 | Go | v2"
type: docx
token: Lq8pdeqGwoAMt0xCa7HctMHznig
sidebar_position: 3
keywords: 
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - クラウド
  - GetReplicateConfiguration
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetReplicateConfiguration

この操作は、Milvus クラスターから現在のレプリケーション構成を取得します。

```go
func (c *Client) GetReplicateConfiguration(ctx context.Context, opts ...grpc.CallOption) (*commonpb.ReplicateConfiguration, error)
```

## リクエスト構文\{#request-syntax}

GetReplicateConfiguration() のリクエストを作成します。

```go
config, err := cli.GetReplicateConfiguration(ctx)
```

**パラメーター：**

- **opts** (*...grpc.CallOption*) -

    省略可能な gRPC 呼び出しオプションです。

**戻り値の型：**

&ast;*commonpb.ReplicateConfiguration, error*

**戻り値：**

構成済みのクラスターとレプリケーショントポロジーを含む、クラスターの現在のレプリケーション構成です。RPC が失敗した場合はエラーを返します。

**パラメーター：**

- **result** (&ast;*commonpb.ReplicateConfiguration*) -

    GetReplicateConfiguration() によって返される &ast;commonpb.ReplicateConfiguration の値です。

**エラーハンドリング：**

- **error**

    操作が失敗します。RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

GetReplicateConfiguration() の使用例を示します。

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

config, err := cli.GetReplicateConfiguration(ctx)
if err != nil {
	// handle error
}
```
