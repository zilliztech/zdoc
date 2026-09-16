---
title: "CreateIndex() | Go | v2"
slug: /go/go/v2-Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたフィールドにインデックスを作成します。作成されたインデックスは、ベクトル類似検索またはスカラー フィルタリングを高速化します。 | Go | v2"
type: docx
token: KLrMdFtVko5QGwxyIs9ckmtUn0c
sidebar_position: 4
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - CreateIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex()

この操作は、指定されたフィールドにインデックスを作成します。作成されたインデックスは、ベクトル類似検索またはスカラー フィルタリングを高速化します。

```go
func (c *Client) CreateIndex(ctx context.Context, option CreateIndexOption, callOptions ...grpc.CallOption) (*CreateIndexTask, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewCreateIndexOption(collectionName, fieldName, index).
    WithIndexName(indexName)

result, err := client.CreateIndex(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象コレクションの名前です。

- **fieldName** (*string*)

    フィールドの名前です。

- **[インデックス](./v2-Management-Index)** (*[index.Index](./v2-Management-Index)*)

    インデックスです。

**オプションメソッド:**

- `WithIndexName(indexName string)`

    インデックス名を設定します。

**戻り値の型:**

&ast;*[CreateIndexTask](./v2-Management-CreateIndexTask), error*

**戻り値:**

インデックスの構築が完了するまで待機するために使用できる CreateIndexTask を返します。操作が失敗した場合は、error を返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

index := index.NewHNSWIndex(entity.COSINE, 32, 128)
indexTask, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "vector", index))
if err != nil {
	// handler err
}

err = indexTask.Await(ctx)
if err != nil {
	// handler err
}
```
