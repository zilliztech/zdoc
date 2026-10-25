---
title: "AddFunctionField | Go | v2"
slug: /go/go/v2-Collection-AddFunctionField
sidebar_label: "AddFunctionField"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、クライアントでフィールドと関数のオプションを検証した後、既存のコレクションに関数フィールドを追加します。 | Go | v2"
type: docx
token: Tn98dTncaoafNVxRazGc47auneY
sidebar_position: 27
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - クラウド
  - AddFunctionField
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddFunctionField

この操作では、クライアントでフィールドと関数のオプションを検証した後、既存のコレクションに関数フィールドを追加します。

```go
func (c *Client) AddFunctionField(ctx context.Context, opt AddFunctionFieldOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AddFunctionField() のリクエストを作成します。

```go
option := milvusclient.NewAddFunctionFieldOption(collectionName, field, function, boundIndex).
    WithIndexName(indexName)

err := client.AddFunctionField(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **field** (&ast;*entity.Field*) -

    **[必須]**

    AddFunctionField で使用するフィールドです。

- **function** (&ast;*entity.Function*) -

    **[必須]**

    AddFunctionField で使用する関数です。

- **boundIndex** (*インデックス.インデックス*) -

    **[必須]**

    AddFunctionField で使用する boundIndex です。

**ビルダーメソッド:**

- `NewAddFunctionFieldOption(collectionName string, field *entity.Field, function *entity.Function, boundIndex index.Index)`

    関数フィールドを追加するためのオプションを作成します。`field` は関数出力フィールドを定義し、`function` は組み込み関数（BM25 または MinHash）を記述し、`boundIndex` は出力フィールドにバインドされたインデックスです。

- `WithIndexName(indexName string)`

    関数出力フィールドにバインドされたインデックスの名前を設定します。

**戻り値の型:**

*error*

**戻り値:**

関数フィールドの追加後に nil を返します。クライアント側の検証または RPC が失敗した場合は、エラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。検証、リクエスト構築、または RPC が失敗した場合です。失敗の詳細を確認するには、`err != nil` を確認してください。

## 例\{#example}

AddFunctionField() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

outputField := entity.NewField().
	WithName("sparse_vector").
	WithDataType(entity.FieldTypeSparseVector)

fn := entity.NewFunction().
	WithName("bm25_fn").
	WithType(entity.FunctionTypeBM25).
	WithInputFields("text").
	WithOutputFields("sparse_vector")

boundIndex := index.NewSparseInvertedIndex(entity.IP, 0.2)

err = cli.AddFunctionField(ctx, milvusclient.NewAddFunctionFieldOption("books", outputField, fn, boundIndex).
	WithIndexName("bm25_index"))
if err != nil {
	// handle error
}
```
