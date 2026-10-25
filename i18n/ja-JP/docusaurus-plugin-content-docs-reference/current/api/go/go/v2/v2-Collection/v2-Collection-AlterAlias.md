---
title: "AlterAlias | Go | v2"
slug: /go/go/v2-Collection-AlterAlias
sidebar_label: "AlterAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のエイリアスを別のコレクションに再割り当てします。 | Go | v2"
type: docx
token: NOBpdRuf2oSRrJxZSYMcOLEcnAE
sidebar_position: 3
keywords: 
  - Milvus ベクトルデータベース
  - Zilliz Cloud
  - Milvus とは
  - Milvus データベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - AlterAlias
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterAlias

この操作は、既存のエイリアスを別のコレクションに再割り当てします。

```go
func (c *Client) AlterAlias(ctx context.Context, option AlterAliasOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AlterAlias() のリクエストを作成します。

```go
option := milvusclient.NewAlterAliasOption(alias, collectionName)

err := client.AlterAlias(ctx, option)
```

**パラメーター:**

- **alias** (*string*) -

    **必須**

    割り当てるエイリアス名です。

- **collectionName** (*string*) -

    **必須**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewAlterAliasOption(alias string, collectionName string)`

    AlterAlias() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラーハンドリング:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

AlterAlias() の使用方法を示します。

```go
import (
	"context"
	"fmt"

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

err = cli.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "customized_setup_1"))
if err != nil {
	// handle error
}

aliases, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_1"))
if err != nil {
	// handle error
}
fmt.Println(aliases)

aliases, err = cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_2"))
if err != nil {
	// handle error
}
fmt.Println(aliases)
```
