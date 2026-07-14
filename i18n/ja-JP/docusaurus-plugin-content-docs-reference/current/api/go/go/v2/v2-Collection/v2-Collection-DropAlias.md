---
title: "DropAlias() | Go | v2"
slug: /go/go/v2-Collection-DropAlias
sidebar_label: "DropAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションエイリアスを削除します。 | Go | v2"
type: docx
token: PLPKdFJ0aoNUyTxMj7Mc3tPVn5d
sidebar_position: 12
keywords: 
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - クラウド
  - DropAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias()

この操作はコレクションエイリアスを削除します。

```go
func (c *Client) DropAlias(ctx context.Context, option DropAliasOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropAliasOption(alias)

err := client.DropAlias(ctx, option)
```

**パラメーター:**

- **[alias](./v2-Collection-Alias)** (*string*)

    割り当てるエイリアス名。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
	// handle error
}
```
