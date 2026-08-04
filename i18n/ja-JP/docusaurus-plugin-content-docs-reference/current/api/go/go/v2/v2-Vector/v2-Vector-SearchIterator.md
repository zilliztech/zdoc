---
title: "SearchIterator() | Go | v2"
slug: /go/go/v2-Vector-SearchIterator
sidebar_label: "SearchIterator()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、大規模な検索結果セットをページネーションするためのイテレータを作成します。 | Go | v2"
type: docx
token: K6obdWvXyoNLbMxNkggc9JyMnPd
sidebar_position: 18
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - SearchIterator()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# SearchIterator()

この操作は、大規模な検索結果セットをページネーションするためのイテレータを作成します。

```go
func (c *Client) SearchIterator(ctx context.Context, option SearchIteratorOption, callOptions ...grpc.CallOption) (SearchIterator, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewSearchIteratorOption(collectionName, vector).
    WithBatchSize(batchSize).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithANNSField(annsField).
    WithGroupByField(groupByField).
    WithGroupSize(groupSize).
    WithStrictGroupSize(strictGroupSize).
    WithIgnoreGrowing(ignoreGrowing).
    WithAnnParam(ap).
    WithSearchParam(key, value).
    WithIteratorLimit(limit)

result, err := client.SearchIterator(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    対象 collection の名前です。

- **[vector](./v2-Vector)** (*entity.Vector*)

    類似検索のクエリ vector です。

**OPTION METHODS:**

- `WithBatchSize(batchSize int)`

    1 回のイテレーションバッチごとに取得するエンティティ数を設定します。

- `WithPartitions(partitionNames ...string)`

    操作を指定した partition に制限します。

- `WithFilter(expr string)`

    boolean フィルター式を適用して結果を絞り込みます。

- `WithTemplateParam(key string, val any)`

    式評価用のテンプレートパラメータを設定します。

- `WithOffset(offset int)`

    一致結果を返す前にスキップする結果数を設定します。

- `WithOutputFields(fieldNames ...string)`

    返される結果に含めるフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    操作の整合性レベルを設定します（Strong、Bounded、Session、または Eventually）。

- `WithANNSField(annsField string)`

    検索対象とする vector フィールドを指定します。

- `WithGroupByField(groupByField string)`

    scalar フィールド値で検索結果をグループ化します。

- `WithGroupSize(groupSize int)`

    各グループごとに返す結果数を設定します。

- `WithStrictGroupSize(strictGroupSize bool)`

    結果内の各グループに対して厳密なグループサイズを強制します。

- `WithIgnoreGrowing(ignoreGrowing bool)`

    より高速ですが不完全になる可能性のある結果のために、growing セグメント内の検索をスキップします。

- `WithAnnParam(ap [index.AnnParam](./v2-Vector-AnnParam))`

    近似最近傍検索のパラメータ（例: nprobe、ef）を設定します。

- `WithSearchParam(key, value string)`

    カスタム検索パラメータのキーと値のペアを設定します。

- `WithIteratorLimit(limit int64)`

    WithIteratorLimit は反復するエントリの上限を設定します。`limit < 0` の場合、Unlimited に設定されます。

**RETURN TYPE:**

*[SearchIterator](./v2-Vector-SearchIterator), error*

**RETURNS:**

検索結果をページネーションするための SearchIterator です。操作に失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"io"

	"github.com/milvus-io/milvus/client/v2/entity"
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

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

iter, err := cli.SearchIterator(ctx, milvusclient.NewSearchIteratorOption(
	"quick_setup",
	entity.FloatVector(queryVector),
).WithOutputFields("id", "color"))
if err != nil {
	// handle error
}

for {
	resultSet, err := iter.Next(ctx)
	if err == io.EOF {
		break
	}
	if err != nil {
		// handle error
	}
	for i := 0; i < resultSet.Len(); i++ {
		fmt.Println(resultSet.IDs, resultSet.Scores)
	}
}
```
