---
title: "GetServerVersion | Go | v2"
slug: /go/go/v2-Client-GetServerVersion
sidebar_label: "GetServerVersion"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、接続されている Milvus サーバーのバージョンを返します。 | Go | v2"
type: docx
token: ZZ1mdvZJVoi5egxObkncej3SnUc
sidebar_position: 3
keywords: 
  - ベクトルデータベースとは
  - ベクトルDB
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - zilliz
  - zilliz cloud
  - クラウド
  - GetServerVersion
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetServerVersion

この操作は、接続されている Milvus サーバーのバージョンを返します。

```go
func (c *Client) GetServerVersion(ctx context.Context, option GetServerVersionOption, callOptions ...grpc.CallOption) (string, error)
```

## リクエスト構文\{#request-syntax}

GetServerVersion() のリクエストを作成します。

```go
option := milvusclient.NewGetServerVersionOption()

version, err := client.GetServerVersion(ctx, option)
```

**ビルダーメソッド：**

- `NewGetServerVersionOption()`

    GetServerVersion() のリクエストを作成します。

**戻り値の型：**

*string, error*

**戻り値：**

リクエストされた文字列値です。操作が失敗した場合、エラーを返します。

**パラメーター：**

- **result** (*string*) - 

    GetServerVersion() によって返される文字列値です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GetServerVersion() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

version, err := cli.GetServerVersion(ctx, milvusclient.NewGetServerVersionOption())
if err != nil {
	log.Fatal("failed to get server version:", err)
}
fmt.Println(version)
```
