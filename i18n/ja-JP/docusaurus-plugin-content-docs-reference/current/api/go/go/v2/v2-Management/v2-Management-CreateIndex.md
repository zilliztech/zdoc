---
title: "CreateIndex | Go | v2"
slug: /go/go/v2-Management-CreateIndex
sidebar_label: "CreateIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションの指定されたフィールドにインデックスを作成し、その進行状況を追跡するためのタスクを返します。 | Go | v2"
type: docx
token: Rrx1dlCBVocbLIxGCBycLTScnUg
sidebar_position: 4
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex

この操作は、コレクションの指定されたフィールドにインデックスを作成し、その進行状況を追跡するためのタスクを返します。

```go
func (c *Client) CreateIndex(ctx context.Context, option CreateIndexOption, callOptions ...grpc.CallOption) (*CreateIndexTask, error)
```

## リクエスト構文\{#request-syntax}

CreateIndex() のリクエストを作成します。

```go
option := milvusclient.NewCreateIndexOption(collectionName, fieldName, idx).
    WithIndexName(indexName)

task, err := client.CreateIndex(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **fieldName** (*string*) -

    **[必須]**

    CreateIndex の fieldName です。

- **インデックス** (*インデックス.インデックス*) -

    **[必須]**

    CreateIndex のインデックスです。

**ビルダーメソッド:**

- `NewCreateIndexOption(collectionName string, fieldName string, index index.Index)`

    インデックスを構築するためのオプションを作成します。`collectionName` はコレクションを指定し、`fieldName` はインデックスを作成するフィールドを指定し、`index` はインデックスの種類とパラメーターを定義します。

- `WithIndexName(indexName string)`

    作成するインデックスの名前を設定します。

- `WithExtraParam(key string, value any)`

    インデックス構築用の追加パラメーターのキーと値のペアを追加します。このメソッドはオプションをその場で変更し、オプションを返さないため、チェーンすることはできません。

**戻り値の型:**

*CreateIndexTask, error*

**戻り値:**

インデックスの構築が完了するまで待機するために使用できる CreateIndexTask を返します。操作が失敗した場合は、エラーを返します。

**パラメーター:**

- **result** ([CreateIndexTask](./v2-Management-CreateIndexTask)) -

    CreateIndex() によって返される CreateIndexTask の値です。

**エラーハンドリング:**

- **error**

    操作が失敗した場合です。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

CreateIndex() の使用例を示します。

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

idx := index.NewAutoIndex(entity.COSINE)

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "vector", idx).
	WithIndexName("vector_index"))
if err != nil {
	// handle error
}

// sync wait index to be created
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
