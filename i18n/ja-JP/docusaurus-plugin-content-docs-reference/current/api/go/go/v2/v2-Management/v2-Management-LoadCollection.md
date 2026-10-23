---
title: "LoadCollection | Go | v2"
slug: /go/go/v2-Management-LoadCollection
sidebar_label: "LoadCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、検索およびクエリ操作のためにコレクションをメモリにロードします。 | Go | v2"
type: docx
token: RGDUdquTToKBJJxdGwlcltJYncd
sidebar_position: 17
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトル DB とは
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - LoadCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadCollection

この操作では、検索およびクエリ操作のためにコレクションをメモリにロードします。

```go
func (c *Client) LoadCollection(ctx context.Context, option LoadCollectionOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## リクエスト構文\{#request-syntax}

LoadCollection() のリクエストを作成します。

```go
option := milvusclient.NewLoadCollectionOption(collectionName).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadCollection(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **［必須］**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewLoadCollectionOption(collectionName string)`

    LoadCollection() のリクエストを作成します。

- `WithReplica(num int)`

    操作のレプリカを設定します。

- `WithResourceGroup(resourceGroups ...string)`

    操作のリソースグループを設定します。

- `WithLoadFields(loadFields ...string)`

    メモリにロードするフィールドを指定します。

- `WithSkipLoadDynamicField(skipFlag bool)`

    操作の動的フィールドのロードをスキップするかどうかを設定します。

- `WithRefresh(isRefresh bool)`

    新しく挿入されたデータを再ロードするためのリフレッシュモードを有効にします。

**戻り値の型:**

*LoadTask, error*

**戻り値:**

ロード操作の完了を待機するために使用できる LoadTask です。操作が失敗した場合は、エラーを返します。

**メソッド:**

- **Await** (*error*) -

    ロードが完了したことが確認されるまでブロックし、コレクションまたはパーティションが完全にロードされたと報告されるか、コンテキストがキャンセルされるまで、タスクのチェック間隔でサーバーをポーリングします。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

LoadCollection() の使用例を示します。

```go
import (
	"context"
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
