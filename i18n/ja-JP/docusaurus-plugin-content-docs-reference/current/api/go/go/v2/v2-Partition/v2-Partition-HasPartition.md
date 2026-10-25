---
title: "HasPartition | Go | v2"
slug: /go/go/v2-Partition-HasPartition
sidebar_label: "HasPartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内にパーティションが存在するかどうかを確認します。 | Go | v2"
type: docx
token: Qn1ddXN3ho1R9ixA2qRcr0JanJb
sidebar_position: 4
keywords: 
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - HasPartition
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HasPartition

この操作は、コレクション内にパーティションが存在するかどうかを確認します。

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## リクエスト構文\{#request-syntax}

HasPartition() のリクエストを作成します。

```go
option := milvusclient.NewHasPartitionOption(collectionName, partitionName)

result, err := client.HasPartition(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    対象のコレクションの名前です。

- **partitionName** (*string*) -

    確認するパーティションの名前です。

**ビルダーメソッド:**

- `NewHasPartitionOption(collectionName string, partitionName string)`

    HasPartition() のリクエストを作成します。

**戻り値の型:**

*has bool, err error*

**戻り値:**

リソースが存在するかどうかを示すブール値です。操作が失敗した場合は、エラーを返します。

**パラメーター:**

- **result** (*has bool*) -

    HasPartition() によって返される has bool 値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

HasPartition() の使用例を示します。

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
result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

fmt.Println(result)
```
