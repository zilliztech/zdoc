---
title: "DropCollectionField | Go | v2"
slug: /go/go/v2-Collection-DropCollectionField
sidebar_label: "DropCollectionField"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションからフィールド名またはフィールド ID でフィールドを削除します。 | Go | v2"
type: docx
token: Cx0Mdu2qio3sZpxtxlDcwPpNnEf
sidebar_position: 28
keywords: 
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionField
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionField

この操作は、既存のコレクションからフィールド名またはフィールド ID でフィールドを削除します。

```go
func (c *Client) DropCollectionField(ctx context.Context, opt DropCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropCollectionField() のリクエストを作成します。

```go
option := milvusclient.NewDropCollectionFieldOption(collectionName, fieldName)

err := client.DropCollectionField(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクションの名前です。

- **fieldID** (*int64*) -

    **[必須]**

    DropCollectionField の fieldName です。

**ビルダーメソッド:**

- `NewDropCollectionFieldOption(collectionName string, fieldName string)`

    名前でフィールドを削除するためのオプションを作成します。

- `NewDropCollectionFieldByIDOption(collectionName string, fieldID int64)`

    フィールド ID でフィールドを削除するためのオプションを作成します。フィールド ID は 0 より大きい必要があります。

**戻り値の型:**

*error*

**戻り値:**

フィールドが削除されると nil を返します。クライアント側の検証または RPC が失敗した場合はエラーを返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。検証、リクエストの構築、または RPC が失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

DropCollectionField() の使用方法を示します。

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

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("books", "old_field"))
if err != nil {
	// handle error
}
```
