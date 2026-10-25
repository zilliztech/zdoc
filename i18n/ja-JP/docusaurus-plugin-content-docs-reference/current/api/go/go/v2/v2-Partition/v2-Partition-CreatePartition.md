---
title: "CreatePartition | Go | v2"
slug: /go/go/v2-Partition-CreatePartition
sidebar_label: "CreatePartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、データを整理するためにコレクション内に新しいパーティションを作成します。 | Go | v2"
type: docx
token: J1U2dUEpqo8RiBxWNKZctY72nZs
sidebar_position: 1
keywords: 
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CreatePartition
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreatePartition

この操作は、データを整理するためにコレクション内に新しいパーティションを作成します。

```go
func (c *Client) CreatePartition(ctx context.Context, opt CreatePartitionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreatePartition() のリクエストを作成します。

```go
option := milvusclient.NewCreatePartitionOption("quick_setup", "partitionA")

 := client.CreatePartition(ctx, option)
```

**ビルダーメソッド：**

- `NewCreatePartitionOption(collectionName string, partitionName string)`

    CreatePartition() のリクエストを作成します。

**戻り値の型：**

*error*

**戻り値：**

成功した場合は nil を返し、それ以外の場合は問題の内容を示すエラーを返します。

**エラーハンドリング：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

CreatePartition() の使用方法を示します。

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

err = cli.CreatePartition(ctx, milvusclient.NewCreatePartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
