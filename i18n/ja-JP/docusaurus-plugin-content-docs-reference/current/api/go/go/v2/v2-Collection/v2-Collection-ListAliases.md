---
title: "ListAliases | Go | v2"
slug: /go/go/v2-Collection-ListAliases
sidebar_label: "ListAliases"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションのエイリアスを返します。 | Go | v2"
type: docx
token: RXGLdpZ23o3178xZTb4cLZBmnQd
sidebar_position: 20
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - ListAliases
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases

この操作は、指定したコレクションのエイリアスを返します。

```go
func (c *Client) ListAliases(ctx context.Context, option ListAliasesOption, callOptions ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

ListAliases() のリクエストを作成します。

```go
option := milvusclient.NewListAliasesOption(collectionName)

result, err := client.ListAliases(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewListAliasesOption(collectionName string)`

    コレクションのエイリアスを一覧表示するためのオプションを作成します。`collectionName` はコレクションを指定します。

**戻り値の型:**

*[]string, error*

**戻り値:**

コレクションのエイリアス名のリストです。操作が失敗した場合はエラーを返します。

**パラメーター:**

- **result** (*[]string*) -

    ListAliases() によって返される []string 値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ListAliases() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("books"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
