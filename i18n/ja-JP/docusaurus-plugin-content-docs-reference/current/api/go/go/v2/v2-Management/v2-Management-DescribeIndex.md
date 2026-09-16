---
title: "DescribeIndex() | Go | v2"
slug: /go/go/v2-Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、タイプ、メトリック、パラメーターを含むインデックスの詳細情報を返します。 | Go | v2"
type: docx
token: PjAddPiH8oyRNpxqafBc1ZGknSd
sidebar_position: 6
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

この操作は、タイプ、メトリック、パラメーターを含むインデックスの詳細情報を返します。

```go
func (c *Client) DescribeIndex(ctx context.Context, opt DescribeIndexOption, callOptions ...grpc.CallOption) (IndexDescription, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDescribeIndexOption(collectionName, indexName)

result, err := client.DescribeIndex(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **indexName** (*string*)

    インデックスの名前。

**戻り値の型:**

*[IndexDescription](./v2-Management-IndexDescription), error*

**戻り値:**

タイプ、メトリック、パラメーターを含むインデックスの詳細。操作が失敗した場合はエラーを返します。

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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

indexInfo, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
fmt.Println(indexInfo)
```
