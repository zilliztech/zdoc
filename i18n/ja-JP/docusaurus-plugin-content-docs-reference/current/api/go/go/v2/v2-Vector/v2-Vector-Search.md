---
title: "Search() | Go | v2"
slug: /go/go/v2-Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションに対して近似最近傍（ANN）検索を実行します。ベクトルベースの検索には `NewSearchOption` を、主キー ID による検索には `NewSearchByIDsOption` を使用できます。 | Go | v2"
type: docx
token: YKm9dpXcVoy277xHVT2cIymfnRj
sidebar_position: 17
keywords: 
  - ベクトルインデックス
  - ベクトルデータベース オープンソース
  - オープンソース ベクトル DB
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - Search()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Search()

この操作は、指定したコレクションに対して近似最近傍（ANN）検索を実行します。ベクトルベースの検索には `NewSearchOption` を、主キー ID による検索には `NewSearchByIDsOption` を使用できます。

```go
func (c *Client) Search(ctx context.Context, option SearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## リクエスト構文\{#request-syntax}

Search() のリクエストを作成します。

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
option := milvusclient.NewSearchByIDsOption(collectionName, limit, ids).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithOutputFields(fieldNames)

resultSets, err := cli.Search(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **limit** (*int*) -

    **[必須]**

    再ランキング後に返す結果の最大数です。

- **ids** (*column.Column*) -

    **[必須]**

    Search のベクトルです。

**ビルダーメソッド:**

- `NewSearchOption(collectionName string, limit int, vectors []entity.Vector)`

    ベクトルベースの ANN 検索用の検索オプションを作成します。

- `NewSearchByIDsOption(collectionName string, limit int, ids column.Column)`

    主キー ID によってエンティティを検索するための検索オプションを作成します。

- `WithPartitions(partitionNames ...string)`

    検索対象を指定したパーティション名に制限します。

- `WithNamespace(namespace string)`

    検索のスコープをコレクションの名前空間に限定します。

- `WithFilter(expr string)`

    検索結果にブール式フィルターを適用します。

- `WithTemplateParam(key string, val any)`

    式の評価に使用するテンプレートパラメーターを設定します。

- `WithOffset(offset int)`

    一致する結果を返す前にスキップする結果数を設定します。

- `WithOutputFields(fieldNames ...string)`

    結果セットで返すフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    検索の整合性レベルを設定します。

- `WithANNSField(annsField string)`

    コレクションに複数のベクトルフィールドがある場合に、検索対象のベクトルフィールドを指定します。

- `WithGroupByField(groupByField string)`

    検索結果を指定したフィールドでグループ化します。

- `WithGroupSize(groupSize int)`

    グループ化が有効な場合に、グループごとに返す結果数を設定します。

- `WithStrictGroupSize(strictGroupSize bool)`

    厳密なグループサイズ制限を適用します。

- `WithIgnoreGrowing(ignoreGrowing bool)`

    検索中に growing セグメントを無視します。

- `WithAnnParam(ap index.AnnParam)`

    近似最近傍検索パラメーター（例: nprobe、ef）を設定します。

- `WithSearchParam(key, value string)`

    カスタム検索パラメーターのキーと値のペアを設定します。

- `WithFunctionReranker(fr *entity.Function)`

    検索結果に関数ベースの reranker を適用します。

- `WithFunctionScore(fs *entity.FunctionScore)`

    検索の [FunctionScore](./v2-Collection-FunctionScore)（関数に加え、boost モードなどのスコアオプション）を設定します。

- `WithSearchAggregation(agg *SearchAggregation)`

    検索の [SearchAggregation(https://zilliverse.feishu.cn/docx/MSU5d8sIDonFYFxLv0Cc88dvnqL) 仕様を設定します。group-by 設定および offset 設定とは同時に使用できません。

**戻り値の型:**

*[]ResultSet, error*

**戻り値:**

一致したエンティティをスコアおよびフィールドとともに含む検索結果またはクエリ結果です。操作が失敗した場合はエラーを返します。

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

    返されたエントリ数です。

- **GroupByValue** (*column.Column*) -

    search/query でグループ化を使用した場合の、group-by 列の値です。

- **IDs** (*column.Column*) -

    一致したエンティティの主キー列です。

- **Fields** (*DataSet*) -

    出力フィールドの列です。

- **AggregationBuckets** (*[]AggregationBucket*) -

    集計が要求された場合の、このクエリの検索集計結果です。

- **Scores** (*[]float32*) -

    各一致結果について、ターゲットベクトルまでの距離です。

- **Recall** (*float32*) -

    検索結果の推定再現率です（Zilliz Cloud により推定）。

- **Err** (*error*) -

    検索エラーがある場合は、そのエラーです。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

Search() の使用例を示します。

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
