---
title: "Search() | Go | v2"
slug: /go/go/v2-Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection に対して近似最近傍（ANN）検索を実行します。ベクトルベースの検索には `NewSearchOption` を、主キー ID による検索には `NewSearchByIDsOption` を使用できます。 | Go | v2"
type: docx
token: YKm9dpXcVoy277xHVT2cIymfnRj
sidebar_position: 12
keywords: 
  - ベクトルインデックス
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - zilliz
  - zilliz cloud
  - クラウド
  - Search()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Search()

この操作は、指定された collection に対して近似最近傍（ANN）検索を実行します。ベクトルベースの検索には `NewSearchOption` を、主キー ID による検索には `NewSearchByIDsOption` を使用できます。

```go
func (c *Client) Search(ctx context.Context, option SearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## Request Syntax\{#request-syntax}

**ベクトル検索:**

```go
option := milvusclient.NewSearchOption(collectionName, limit, vectors).
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
    WithFunctionReranker(fr)

resultSets, err := cli.Search(ctx, option)
```

**主キー ID による検索:**

```go
option := milvusclient.NewSearchByIDsOption(collectionName, limit, ids).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithOutputFields(fieldNames)

resultSets, err := cli.Search(ctx, option)
```

**PARAMETERS:**

- **option** (*SearchOption*) -

    検索オプション。ベクトル検索には `NewSearchOption` を、PK ベースの検索には `NewSearchByIDsOption` を使用します。

**BUILDER METHODS:**

- `NewSearchOption(collectionName string, limit int, vectors []entity.Vector)`
ベクトルベースの ANN 検索用の検索オプションを作成します。

- `NewSearchByIDsOption(collectionName string, limit int, ids column.Column)`
主キー ID によって entity を検索するための検索オプションを作成します。

- `WithPartitions(partitionNames ...string)`
検索対象を指定した partition 名に制限します。

- `WithFilter(expr string)`
検索結果にブール式フィルターを適用します。

- `WithTemplateParam(key string, val any)`
式評価用のテンプレートパラメーターを設定します。

- `WithOffset(offset int)`
一致結果を返す前にスキップする結果数を設定します。

- `WithOutputFields(fieldNames ...string)`
結果セットで返すフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`
検索の整合性レベルを設定します。

- `WithANNSField(annsField string)`
collection に複数のベクトルフィールドがある場合に、検索対象のベクトルフィールドを指定します。

- `WithGroupByField(groupByField string)`
検索結果を指定したフィールドでグループ化します。

- `WithGroupSize(groupSize int)`
グループ化が有効な場合に、各グループごとに返す結果数を設定します。

- `WithStrictGroupSize(strictGroupSize bool)`
厳密なグループサイズ制限を適用します。

- `WithIgnoreGrowing(ignoreGrowing bool)`
検索中に growing セグメントを無視します。

- `WithAnnParam(ap index.AnnParam)`
近似最近傍検索パラメーター（例: nprobe、ef）を設定します。

- `WithSearchParam(key, value string)`
カスタム検索パラメーターのキーと値のペアを設定します。

- `WithFunctionReranker(fr *entity.Function)`
関数ベースの reranker を検索結果に適用します。

**RETURN TYPE:**

*[]ResultSet, error*

**RETURNS:**

スコアとフィールドを含む、一致した entity の検索またはクエリ結果です。操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は err != nil を確認してください。

## Example\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
	APIKey:  token,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
	"quick_setup", // collectionName
	3,             // limit
	[]entity.Vector{entity.FloatVector(queryVector)},
))
if err != nil {
	log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
