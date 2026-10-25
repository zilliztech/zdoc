---
title: "HasCollection | Go | v2"
slug: /go/go/v2-Collection-HasCollection
sidebar_label: "HasCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、接続されている Milvus インスタンスにコレクションが存在するかどうかを確認します。 | Go | v2"
type: docx
token: T0tQdxsOBolMhFxvjTZcukxHnqh
sidebar_position: 19
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - HasCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HasCollection

この操作は、接続されている Milvus インスタンスにコレクションが存在するかどうかを確認します。

```go
func (c *Client) HasCollection(ctx context.Context, option HasCollectionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## リクエスト構文\{#request-syntax}

HasCollection() のリクエストを作成します。

```go
option := milvusclient.NewHasCollectionOption(collectionName)

result, err := client.HasCollection(ctx, option)
```

**パラメーター：**

- **name** (*string*) -

    **【必須】**

    作成するコレクションの名前です。

**ビルダーメソッド：**

- `NewHasCollectionOption(name string)`

    コレクションが存在するかどうかを確認するためのオプションを作成します。`name` は確認するコレクションを指定します。

**戻り値の型：**

*has bool, err error*

**戻り値：**

コレクションが存在するかどうかを示すブール値です。操作が失敗した場合はエラーを返します。

**パラメーター：**

- **result** (*has bool*) -

    HasCollection() によって返される has bool の値です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

HasCollection() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption("books"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
