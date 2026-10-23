---
title: "ResultSet | Go | v2"
slug: /go/go/v2-Vector-ResultSet
sidebar_label: "ResultSet"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ResultSet インスタンスは、`Search()`、`HybridSearch()`、`Query()`、および `Get()` によって返される検索結果またはクエリ結果セットです。返されたエントリ数、主キー、出力フィールド、およびスコアを保持します。 | Go | v2"
type: docx
token: N4dudTInDoPuE4xPup5c0a60ngO
sidebar_position: 14
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - ResultSet
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ResultSet

ResultSet インスタンスは、`Search()`、`HybridSearch()`、`Query()`、および `Get()` によって返される検索結果またはクエリ結果セットです。返されたエントリ数、主キー、出力フィールド、およびスコアを保持します。

```go
type ResultSet struct {
    ResultCount int
    GroupByValue column.Column
    IDs column.Column
    Fields DataSet
    AggregationBuckets []AggregationBucket
    Scores []float32
    Recall float32
    Err error
}
```

**フィールド:**

- **ResultCount** (*int*) -

    返されたエントリ数です。

- **GroupByValue** (*column.Column*) -

    search/query でグループ化が使用された場合の group-by 列の値です。

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

    検索エラーが存在する場合は、そのエラーです。

**ビルダーメソッド:**

- `GetColumn(fieldName string) column.Column`

    指定されたフィールド名の列を返します。

- `Len() int`

    返されたエントリの数を返します。

- `Slice(start, end int) ResultSet`

    指定された開始インデックスと終了インデックスの間にある結果のサブセットを返します。

- `Unmarshal(receiver any) error`

    データセットを、行ベースでモデル構造体へのポインターのスライスにアンマーシャルします。なお、distance/score はここではアンマーシャルされません。

## 例\{#example}

ResultSet の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors))
if err != nil {
	// handle error
}
resultSet := resultSets[0]
fmt.Println(resultSet.ResultCount, resultSet.Scores)
```
