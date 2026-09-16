---
title: "ListPartitions() | Go | v2"
slug: /go/go/v2-Partition-ListPartitions
sidebar_label: "ListPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクション内のすべてのパーティションを一覧表示します。 | Go | v2"
type: docx
token: ZNvXd7eldozvRHxpHOcc5CPAnug
sidebar_position: 5
keywords: 
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - ListPartitions()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions()

この操作は、コレクション内のすべてのパーティションを一覧表示します。

```go
func (c *Client) ListPartitions(ctx context.Context, opt ListPartitionsOption, callOptions ...grpc.CallOption) (partitionNames []string, err error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewListPartitionOption(collectionName)

result, err := client.ListPartitions(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

対象のコレクションの名前。

**戻り値の型:**

*partitionNames []string, err error*

**戻り値:**

名前の一覧です。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

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

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
