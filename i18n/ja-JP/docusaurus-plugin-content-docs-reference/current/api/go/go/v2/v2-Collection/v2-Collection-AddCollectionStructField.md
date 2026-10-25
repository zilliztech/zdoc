---
title: "AddCollectionStructField | Go | v2"
slug: /go/go/v2-Collection-AddCollectionStructField
sidebar_label: "AddCollectionStructField"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、クライアント側でフィールドオプションを検証した後、既存のコレクションに struct 配列フィールドを追加します。 | Go | v2"
type: docx
token: ZSsxdrxftoPHDhxu0u6c8j2Fntm
sidebar_position: 26
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - AddCollectionStructField
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddCollectionStructField

この操作は、クライアント側でフィールドオプションを検証した後、既存のコレクションに struct 配列フィールドを追加します。

```go
func (c *Client) AddCollectionStructField(ctx context.Context, opt AddCollectionStructFieldOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AddCollectionStructField() のリクエストを作成します。

```go
option := milvusclient.NewAddCollectionStructFieldOption(collectionName, field)

err := client.AddCollectionStructField(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクション名です。

- **field** (&ast;*entity.Field*) -

    **[必須]**

    AddCollectionStructField の対象となるフィールドです。

**ビルダーメソッド:**

- `NewAddCollectionStructFieldOption(collectionName string, field *entity.Field)`

    struct 配列フィールドを追加するためのオプションを作成します。フィールドは、Struct 要素タイプを持つ Array データ型を使用し、struct スキーマを含める必要があります。`collectionName` はコレクションを指定し、`field` は追加するフィールドを定義します。

**戻り値の型:**

*error*

**戻り値:**

フィールドの追加後に nil を返します。クライアント側の検証または RPC が失敗した場合はエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

AddCollectionStructField() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("title").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256))

field := entity.NewField().
	WithName("chunks").
	WithDataType(entity.FieldTypeArray).
	WithElementType(entity.FieldTypeStruct).
	WithStructSchema(structSchema)

err = cli.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("books", field))
if err != nil {
	// handle error
}
```
