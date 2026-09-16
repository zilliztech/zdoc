---
title: "LoadPartitions() | Go | v2"
slug: /go/go/v2-Management-LoadPartitions
sidebar_label: "LoadPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションの特定のパーティションをメモリにロードします。 | Go | v2"
type: docx
token: LMXGdDnueontIFxuqAIcS8D6nJc
sidebar_position: 19
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - LoadPartitions()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadPartitions()

この操作は、コレクションの特定のパーティションをメモリにロードします。

```go
func (c *Client) LoadPartitions(ctx context.Context, option LoadPartitionsOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewLoadPartitionsOption(collectionName, partitionsNames).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadPartitions(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **partitionsNames** (*...string*)

    パーティションの名前。

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

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

task, err := cli.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("quick_setup", "partitionA"))

// sync wait collection to be loaded
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
