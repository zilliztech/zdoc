---
title: "Get() | Go | v2"
slug: /go/go/v2-Vector-Get
sidebar_label: "Get()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、主キー値によってエンティティを取得します。 | Go | v2"
type: docx
token: FLBRdxZqWojjpXxuwJZc5APKncC
sidebar_position: 4
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - Get()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Get()

この操作は、主キー値によってエンティティを取得します。

```go
func (c *Client) Get(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewQueryOption(collectionName).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithLimit(limit).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithPartitions(partitionNames).
    WithIDs(ids)

result, err := client.Get(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象 collection の名前。

**オプションメソッド:**

- `WithFilter(expr string)`

    結果を絞り込むために、ブールフィルター式を適用します。

- `WithTemplateParam(key string, val any)`

    式評価のためのテンプレートパラメータを設定します。

- `WithOffset(offset int)`

    一致結果を返す前にスキップする結果数を設定します。

- `WithLimit(limit int)`

    返す結果の最大数を設定します。

- `WithOutputFields(fieldNames ...string)`

    返される結果に含めるフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    操作の整合性レベルを設定します（Strong、Bounded、Session、または Eventually）。

- `WithPartitions(partitionNames ...string)`

    操作を指定した partition に限定します。

- `WithIDs(ids column.Column)`

    操作の IDs を設定します。

**戻り値の型:**

*[ResultSet](./v2-Vector-ResultSet), error*

**戻り値:**

一致したエンティティのスコアとフィールドを含む検索またはクエリ結果です。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/column"
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

rs, err := cli.Get(ctx, milvusclient.NewQueryOption("quick_setup").
	WithIDs(column.NewColumnInt64("id", []int64{1, 2, 3})))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
