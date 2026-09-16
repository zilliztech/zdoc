---
title: "HasPartition() | Go | v2"
slug: /go/go/v2-Partition-HasPartition
sidebar_label: "HasPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションにパーティションが存在するかどうかを確認します。 | Go | v2"
type: docx
token: Cased8tfhoZ25Sx4VALcy4gZnbh
sidebar_position: 4
keywords: 
  - k 最近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - HasPartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasPartition()

この操作は、コレクションにパーティションが存在するかどうかを確認します。

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewHasPartitionOption(collectionName, partitionName)

result, err := client.HasPartition(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクション名。

- **partitionName** (*string*)

    確認するパーティションの名前。

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
result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

fmt.Println(result)
```
