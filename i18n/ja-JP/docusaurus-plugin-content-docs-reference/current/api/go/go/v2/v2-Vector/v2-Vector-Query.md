---
title: "Query() | Go | v2"
slug: /go/go/v2-Vector-Query
sidebar_label: "Query()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ブールフィルター式に一致するエンティティを取得します。 | Go | v2"
type: docx
token: P84bd17ncosvh4xuahpcFGzoneb
sidebar_position: 8
keywords: 
  - オープンソース vector db
  - vector database の例
  - rag vector database
  - vector db とは
  - zilliz
  - zilliz cloud
  - cloud
  - Query()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Query()

この操作は、ブールフィルター式に一致するエンティティを取得します。

```go
func (c *Client) Query(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## Request Syntax\{#request-syntax}

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

result, err := client.Query(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    対象 collection の名前。

**OPTION METHODS:**

- `WithFilter(expr string)`

    結果を絞り込むためにブールフィルター式を適用します。

- `WithTemplateParam(key string, val any)`

    式の評価用にテンプレートパラメータを設定します。

- `WithOffset(offset int)`

    一致する結果を返す前にスキップする件数を設定します。

- `WithLimit(limit int)`

    返す結果の最大件数を設定します。

- `WithOutputFields(fieldNames ...string)`

    返される結果に含めるフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    この操作の整合性レベルを設定します（Strong、Bounded、Session、または Eventually）。

- `WithPartitions(partitionNames ...string)`

    この操作を指定した partition に限定します。

- `WithIDs(ids column.Column)`

    この操作の IDs を設定します。

**RETURN TYPE:**

*[ResultSet](./v2-Vector-ResultSet), error*

**RETURNS:**

一致したエンティティのスコアとフィールドを含む search または query の結果です。操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"
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

rs, err := cli.Query(ctx, milvusclient.NewQueryOption("quick_setup").
	WithFilter("emb_type == 3").
	WithOutputFields("id", "emb_type"))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
