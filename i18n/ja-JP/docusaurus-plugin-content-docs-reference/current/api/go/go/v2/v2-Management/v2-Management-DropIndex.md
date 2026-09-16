---
title: "DropIndex() | Go | v2"
slug: /go/go/v2-Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのフィールドからインデックスを削除します。 | Go | v2"
type: docx
token: DzchdYLEYomSrzxOys8c1mbanhg
sidebar_position: 7
keywords: 
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - Milvus オープンソース
  - Milvus の仕組み
  - zilliz
  - zilliz cloud
  - クラウド
  - DropIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex()

この操作は、コレクションのフィールドからインデックスを削除します。

```go
func (c *Client) DropIndex(ctx context.Context, opt DropIndexOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropIndexOption(collectionName, indexName)

err := client.DropIndex(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **indexName** (*string*)

    インデックスの名前。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil、失敗した場合は問題の内容を示す error を返します。

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
