---
title: "New | Go | v2"
slug: /go/go/v2-Client-New
sidebar_label: "New"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された設定で指定された Milvus サーバーへの接続を作成します。 | Go | v2"
type: docx
token: TiJxdTD1yoot4TxXHHUchnERn8e
sidebar_position: 4
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - New
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# New

この操作は、指定された設定で指定された Milvus サーバーへの接続を作成します。

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

## リクエスト構文\{#request-syntax}

指定された Milvus サーバーへの接続を作成します。

```go
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
```

**パラメーター:**

- **config** (&ast;*ClientConfig*) -

    Milvus サーバーのアドレスを含む、接続の設定です。

**戻り値の型:**

&ast;*Client, error*

**戻り値:**

使用可能な、接続済みの Client インスタンスです。接続に失敗した場合はエラーを返します。

**パラメーター:**

- **result** (&ast;*Client*) -

    New() によって返される &ast;Client 値です。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

New() の使用方法を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// Connect to a local Milvus server
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

collections, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	log.Fatal("failed to list collections:", err)
}
fmt.Println(collections)
```
