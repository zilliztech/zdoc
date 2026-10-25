---
title: "HybridSearch() | Go | v2"
slug: /go/go/v2-Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、複数の検索リクエストを使用してコレクション内の複数のベクトルフィールドを対象に ANN 検索を実行し、その結果を reranker で結合してランク付けします。 | Go | v2"
type: docx
token: VneHdph9ZoSf9wxQdKBc0046nBT
sidebar_position: 10
keywords: 
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - HybridSearch()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HybridSearch()

この操作は、複数の検索リクエストを使用してコレクション内の複数のベクトルフィールドを対象に ANN 検索を実行し、その結果を reranker で結合してランク付けします。

```go
func (c *Client) HybridSearch(ctx context.Context, option HybridSearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## リクエスト構文\{#request-syntax}

HybridSearch() のリクエストを作成します。

```go
annReq1 := milvusclient.NewAnnRequest("dense_vector", 10, denseVectors...)
annReq2 := milvusclient.NewAnnRequest("sparse_vector", 10, sparseVectors...)

option := milvusclient.NewHybridSearchOption(collectionName, 10, annReq1, annReq2).
    WithPartitions(partitionNames).
    WithNamespace(namespace).
    WithOutputFields(outputFields).
    WithConsistencyLevel(consistencyLevel).
    WithReranker(reranker).
    WithOffset(offset)

resultSets, err := cli.HybridSearch(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **limit** (*int*) -

    **[必須]**

    再ランキング後に返す結果の最大数です。

- **annRequests** (<em>...</em>AnnRequest&ast;) -

    **[必須]**

    `NewAnnRequest` で作成する、ベクトルフィールドごとの 1 つ以上の ANN 検索リクエストです。

**ビルダーメソッド:**

- `NewHybridSearchOption(collectionName string, limit int, annRequests ...*AnnRequest)`

    ハイブリッド検索の新しいオプションを作成します。各サブリクエストは `NewAnnRequest(annField, limit, vectors...)` で作成します。

- `NewAnnRequest(annField string, limit int, vectors ...entity.Vector)`

    単一のベクトルフィールドに対する ANN 検索サブリクエストを作成します。

- `WithConsistencyLevel(cl entity.ConsistencyLevel)`

    検索の整合性レベルを設定します。

- `WithPartitions(partitions ...string)`

    検索を指定したパーティションに制限します。

- `WithNamespace(namespace string)`

    検索する namespace を指定します。

- `WithOutputFields(outputFields ...string)`

    結果セットで返すフィールドを指定します。

- `WithReranker(reranker [Reranker](Reranker.md))`

    フィールドごとの結果を結合してランク付けする reranker を設定します。作成には `NewRRFReranker()` または `NewWeightedReranker()` を使用します。

- `WithFunctionRerankers(functionReranker *entity.Function)`

    ハイブリッド検索の各サブ検索にスコアリング Function をサーバー上で適用します。

- `WithFunctionScore(fs *entity.FunctionScore)`

    検索の [FunctionScore](./v2-Collection-FunctionScore)（関数に加え、boost モードなどのスコアオプション）を設定します。

- `WithOffset(offset int)`

    一致結果を返す前にスキップする結果数を設定します。

**戻り値の型:**

*[]ResultSet, error*

**戻り値:**

一致したエンティティをスコアおよびフィールドとともに含む検索結果です。操作が失敗した場合はエラーを返します。

```go
type ResultSet struct {
    ResultCount  int
    GroupByValue column.Column
    IDs          column.Column
    Fields       DataSet
    AggregationBuckets []AggregationBucket
    Scores       []float32
    Recall       float32
    Err          error
}
```

**パラメーター:**

- **ResultCount** (*int*) -

    返されるエントリ数です。

- **GroupByValue** (*column.Column*) -

    search/query でグループ化を使用した場合の、グループ化列の値です。

- **IDs** (*column.Column*) -

    一致したエンティティの主キー列です。

- **Fields** (*DataSet*) -

    出力フィールドの列です。

- **AggregationBuckets** (*[]AggregationBucket*) -

    集約が要求された場合の、このクエリの検索集約結果です。

- **Scores** (*[]float32*) -

    各一致結果の、対象ベクトルまでの距離です。

- **Recall** (*float32*) -

    検索結果の推定再現率です（Zilliz Cloud による推定）。

- **Err** (*error*) -

    検索エラー（存在する場合）です。

**エラー処理:**

- **error**

    操作が失敗しました。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

HybridSearch() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

denseVectors := []entity.Vector{entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835})}
sparse, err := entity.NewSliceSparseEmbedding([]uint32{1, 2}, []float32{0.5, 0.3})
if err != nil {
	log.Fatal("failed to construct sparse embedding: ", err.Error())
}
sparseVectors := []entity.Vector{sparse}

denseReq := milvusclient.NewAnnRequest("dense_vector", 10, denseVectors...)
sparseReq := milvusclient.NewAnnRequest("sparse_vector", 10, sparseVectors...)

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
	"quick_setup", // collectionName
	10,            // limit
	denseReq, sparseReq,
))
if err != nil {
	log.Fatal("failed to perform hybrid search: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
