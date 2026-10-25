---
title: "ListCollections | Go | v2"
slug: /go/go/v2-Collection-ListCollections
sidebar_label: "ListCollections"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在のデータベース内のすべてのコレクションを一覧表示します。 | Go | v2"
type: docx
token: TEBxdE4JvooYMjxHloBcP9k6nE6
sidebar_position: 21
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollections
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListCollections

この操作は、現在のデータベース内のすべてのコレクションを一覧表示します。

```go
func (c *Client) ListCollections(ctx context.Context, option ListCollectionOption, callOptions ...grpc.CallOption) (collectionNames []string, err error)
```

## リクエスト構文\{#request-syntax}

ListCollections() のリクエストを作成します。

```go
option := milvusclient.NewListCollectionOption()

result, err := client.ListCollections(ctx, option)
```

**ビルダーメソッド:**

- `NewListCollectionOption()`

    ListCollections() のリクエストを作成します。

**戻り値の型:**

*collectionNames []string, err error*

**戻り値:**

名前のリストです。操作が失敗した場合はエラーを返します。

**パラメーター:**

- **result** (*collectionNames []string*) -

    ListCollections() から返される collectionNames []string 値です。

**エラー処理:**

- **error**

    操作が失敗した場合です。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ListCollections() の使用方法を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	// handle error
}

fmt.Println(collectionNames)
```
