---
title: "ListPartitions | Go | v2"
slug: /go/go/v2-Partition-ListPartitions
sidebar_label: "ListPartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内のすべてのパーティションを一覧表示します。 | Go | v2"
type: docx
token: YMkedZlN9ozHlVx28ERcGYzEn6f
sidebar_position: 5
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - Zilliz Cloud
  - クラウド
  - ListPartitions
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListPartitions

この操作は、コレクション内のすべてのパーティションを一覧表示します。

```go
func (c *Client) ListPartitions(ctx context.Context, opt ListPartitionsOption, callOptions ...grpc.CallOption) (partitionNames []string, err error)
```

## リクエスト構文\{#request-syntax}

ListPartitions() のリクエストを作成します。

```go
option := milvusclient.NewListPartitionOption(collectionName)

result, err := client.ListPartitions(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewListPartitionOption(collectionName string)`

    ListPartitions() のリクエストを作成します。

**戻り値の型:**

*partitionNames []string, err error*

**戻り値:**

名前のリストです。操作が失敗した場合は、エラーを返します。

**パラメーター:**

- **result** (*partitionNames []string*) -

    ListPartitions() によって返される partitionNames []string の値です。

**エラーハンドリング:**

- **error**

    操作が失敗しました。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ListPartitions() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
