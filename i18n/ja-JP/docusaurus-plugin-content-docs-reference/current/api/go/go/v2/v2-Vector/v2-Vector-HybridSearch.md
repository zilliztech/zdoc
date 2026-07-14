---
title: "HybridSearch() | Go | v2"
slug: /go/go/v2-Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、異なる vector field または index type を対象とする複数の ANN リクエストの結果を組み合わせるハイブリッド検索を実行します。結果の統合と並べ替えには reranker を使用します。 | Go | v2"
type: docx
token: VneHdph9ZoSf9wxQdKBc0046nBT
sidebar_position: 5
keywords: 
  - 音声検索
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - HybridSearch()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HybridSearch()

この操作は、異なる vector field または index type を対象とする複数の ANN リクエストの結果を組み合わせるハイブリッド検索を実行します。結果の統合と並べ替えには reranker を使用します。

```go
func (c *Client) HybridSearch(ctx context.Context, option HybridSearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewHybridSearchOption(collectionName, limit, annRequests).
    WithConsistencyLevel(cl).
    WithPartitions(partitions).
    WithOutputFields(outputFields).
    WithReranker(reranker).
    WithFunctionRerankers(functionReranker).
    WithOffset(offset)

resultSets, err := cli.HybridSearch(ctx, option)
```

**パラメータ:**

- **option** (*HybridSearchOption*) -

    ハイブリッド検索オプションです。

**ビルダーメソッド:**

- `NewHybridSearchOption(collectionName string, limit int, annRequests ...*AnnRequest)`
1 つ以上の ANN リクエストを使用してハイブリッド検索オプションを作成します。

- `NewAnnRequest(fieldName string, limit int, vector entity.Vector)`
特定の vector field 用の ANN リクエストを作成します。

- `WithIDs(ids column.Column)`
指定した primary key ID のみを検索対象とするように ANN リクエストをフィルタリングします。

- `WithFilter(expr string)`
ANN リクエストに boolean expression フィルターを適用します。

- `WithOffset(offset int)`
ANN リクエストでスキップする結果数を設定します。

- `WithGroupByField(groupByField string)`
ANN リクエストの結果を指定したフィールドでグループ化します。

- `WithGroupSize(groupSize int)`
グループごとの結果数を設定します。

- `WithStrictGroupSize(strictGroupSize bool)`
厳密なグループサイズ制限を適用します。

- `WithIgnoreGrowing(ignoreGrowing bool)`
ANN リクエスト中に growing segment を無視します。

- `WithAnnParam(ap index.AnnParam)`
リクエストの ANN パラメータを設定します。

- `WithSearchParam(key, value string)`
ANN リクエストにカスタム検索パラメータを設定します。

- `WithFunctionReranker(fr *entity.Function)`
ANN リクエストに function reranker を適用します。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`
ハイブリッド検索の整合性レベルを設定します。

- `WithPartitions(partitionNames ...string)`
ハイブリッド検索を指定した partition に限定します。

- `WithOutputFields(fieldNames ...string)`
結果セットで返すフィールドを指定します。

- `WithReranker(reranker milvusclient.Reranker)`
複数の ANN リクエストからの結果を統合して並べ替える reranker を設定します。

- `WithFunctionRerankers(functionReranker ...*entity.Function)`
ハイブリッド検索用の function ベースの reranker を設定します。

- `WithOffset(offset int)`
一致を返す前にスキップする結果数を設定します。

**戻り値の型:**

*[]ResultSet, error*

**戻り値:**

すべての ANN リクエストからのスコアとフィールドを含む、一致したエンティティのハイブリッド検索結果です。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は err != nil を確認してください。

## 例\{#example}

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
sparseVector, _ := entity.NewSliceSparseEmbedding([]uint32{1, 21, 100}, []float32{0.1, 0.2, 0.3})

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
	"quick_setup",
	3,
	milvusclient.NewAnnRequest("dense_vector", 10, entity.FloatVector(queryVector)),
	milvusclient.NewAnnRequest("sparse_vector", 10, sparseVector),
).WithReranker(milvusclient.NewRRFReranker()))
if err != nil {
	log.Fatal("failed to perform hybrid search: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
