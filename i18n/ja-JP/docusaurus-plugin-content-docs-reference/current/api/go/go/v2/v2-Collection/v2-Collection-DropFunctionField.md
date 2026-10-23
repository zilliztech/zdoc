---
title: "DropFunctionField | Go | v2"
slug: /go/go/v2-Collection-DropFunctionField
sidebar_label: "DropFunctionField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、関数名を指定して既存のコレクションから関数を削除します。 | Go | v2"
type: docx
token: Gp7KdpBhUoFdH0xfPFUcy7A1n7e
sidebar_position: 29
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - DropFunctionField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropFunctionField

この操作は、関数名を指定して既存のコレクションから関数を削除します。

```go
func (c *Client) DropFunctionField(ctx context.Context, opt DropFunctionFieldOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropFunctionField() のリクエストを作成します。

```go
option := milvusclient.NewDropFunctionFieldOption(collectionName, functionName)

err := client.DropFunctionField(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **functionName** (*string*) -

    **[必須]**

    DropFunctionField で使用する functionName です。

**ビルダーメソッド:**

- `NewDropFunctionFieldOption(collectionName string, functionName string)`

    関数名を指定して関数を削除するためのオプションを作成します。`collectionName` はコレクションを指定し、`functionName` は削除する関数を指定します。

**戻り値の型:**

*error*

**戻り値:**

関数の削除後に nil を返します。クライアント側の検証または RPC が失敗した場合は、エラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。検証、リクエスト構築、または RPC が失敗した場合です。失敗の詳細を確認するには、`err != nil` を確認してください。

## 例\{#example}

DropFunctionField() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.DropFunctionField(ctx, milvusclient.NewDropFunctionFieldOption("books", "bm25_fn"))
if err != nil {
	// handle error
}
```
