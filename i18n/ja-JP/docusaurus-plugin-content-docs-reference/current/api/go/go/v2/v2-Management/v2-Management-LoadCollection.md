---
title: "LoadCollection() | Go | v2"
slug: /go/go/v2-Management-LoadCollection
sidebar_label: "LoadCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、検索およびクエリ操作のためにコレクションをメモリにロードします。 | Go | v2"
type: docx
token: B5w2dyWunogsmAxlJfQcQp8qnRg
sidebar_position: 18
keywords: 
  - IVF
  - knn
  - 画像検索
  - LLMs
  - zilliz
  - zilliz cloud
  - クラウド
  - LoadCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadCollection()

この操作は、検索およびクエリ操作のためにコレクションをメモリにロードします。

```go
func (c *Client) LoadCollection(ctx context.Context, option LoadCollectionOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewLoadCollectionOption(collectionName).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadCollection(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

**オプションメソッド:**

- `WithReplica(num int)`

    操作のレプリカを設定します。

- `WithResourceGroup(resourceGroups ...string)`

    操作のリソースグループを設定します。

- `WithLoadFields(loadFields ...string)`

    メモリにロードするフィールドを指定します。

- `WithSkipLoadDynamicField(skipFlag bool)`

    操作で動的フィールドのロードをスキップするかどうかを設定します。

- `WithRefresh(isRefresh bool)`

    新しく挿入されたデータを再ロードするためのリフレッシュモードを有効にします。

**戻り値の型:**

*[LoadTask](./v2-Management-LoadTask), error*

**戻り値:**

ロード操作の完了を待機するために使用できる LoadTask を返します。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
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

loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("customized_setup_1"))
if err != nil {
	// handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
	// handle error
}
```
