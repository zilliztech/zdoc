---
title: "HasCollection() | Go | v2"
slug: /go/go/v2-Collection-HasCollection
sidebar_label: "HasCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のデータベースにコレクションが存在するかどうかを確認します。 | Go | v2"
type: docx
token: JfRidhpQRo2tZFxrL87cNODunWc
sidebar_position: 19
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection()

この操作は、現在のデータベースにコレクションが存在するかどうかを確認します。

```go
func (c *Client) HasCollection(ctx context.Context, option HasCollectionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewHasCollectionOption(name)

result, err := client.HasCollection(ctx, option)
```

**パラメーター:**

- **name** (*string*)

    対象のコレクション名。

**戻り値の型:**

*has bool, err error*

**戻り値:**

リソースが存在するかどうかを示すブール値です。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

has, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(has)
```
