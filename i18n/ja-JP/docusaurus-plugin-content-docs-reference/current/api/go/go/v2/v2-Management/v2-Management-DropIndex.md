---
title: "DropIndex | Go | v2"
slug: /go/go/v2-Management-DropIndex
sidebar_label: "DropIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのフィールドからインデックスを削除します。 | Go | v2"
type: docx
token: Fjo3dPXt5o62BPxPefHcUFbtnoc
sidebar_position: 7
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - クラウド
  - DropIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropIndex

この操作は、コレクションのフィールドからインデックスを削除します。

```go
func (c *Client) DropIndex(ctx context.Context, opt DropIndexOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropIndex() のリクエストを作成します。

```go
option := milvusclient.NewDropIndexOption(collectionName, indexName)

err := client.DropIndex(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクションの名前です。

- **indexName** (*string*) -

    **[必須]**

    インデックスの名前です。

**ビルダーメソッド:**

- `NewDropIndexOption(collectionName string, indexName string)`

    DropIndex() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示す error を返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropIndex() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
```
