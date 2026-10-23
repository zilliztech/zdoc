---
title: "Get | Go | v2"
slug: /go/go/v2-Vector-Get
sidebar_label: "Get"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、主キー値によってエンティティを取得します。 | Go | v2"
type: docx
token: PUZvdUzxzomdrFxCMlSc4UUqnGg
sidebar_position: 8
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - cloud
  - Get
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Get

この操作は、主キー値によってエンティティを取得します。

```go
func (c *Client) Get(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## リクエスト構文\{#request-syntax}

Get() のリクエストを作成します。

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

**パラメーター:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewQueryOption(collectionName string)`

    Get() のリクエストを作成します。

- `WithFilter(expr string)`

    結果を絞り込むためのブールフィルター式を適用します。

- `WithTemplateParam(key string, val any)`

    式の評価用のテンプレートパラメーターを設定します。

- `WithOffset(offset int)`

    一致する結果を返す前にスキップする結果数を設定します。

- `WithLimit(limit int)`

    返す結果の最大数を設定します。

- `WithOutputFields(fieldNames ...string)`

    返される結果に含めるフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](../Collection/ConsistencyLevel.md))`

    この操作の整合性レベル（Strong、Bounded、Session、または Eventually）を設定します。

- `WithPartitions(partitionNames ...string)`

    この操作を指定したパーティションに限定します。

- `WithNamespace(namespace string)`

    クエリの対象をコレクションの namespace に限定します。

- `WithOrderByFields(fields ...string)`

    クエリ結果を指定したスカラーフィールドで並べ替えます。各指定は `fieldName` または `fieldName:asc` / `fieldName:desc` です（デフォルトは昇順）。order-by フィールドを設定する場合、サーバーでは明示的な limit が必要です。

- `WithIDs(ids column.Column)`

    この操作の ID を設定します。

**戻り値の型:**

*ResultSet, error*

**戻り値:**

一致したエンティティのスコアとフィールドを含む検索またはクエリの結果です。操作が失敗した場合はエラーを返します。

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

    検索処理（search/query）でグループ化を使用した場合の group-by 列の値です。

- **IDs** (*column.Column*) -

    一致したエンティティの主キー列です。

- **Fields** (*DataSet*) -

    出力フィールドの列です。

- **AggregationBuckets** (*[]AggregationBucket*) -

    集計が要求された場合の、このクエリの検索集計結果です。

- **Scores** (*[]float32*) -

    各一致結果のターゲットベクトルまでの距離です。

- **Recall** (*float32*) -

    検索結果の推定再現率です（Zilliz Cloud による推定）。

- **Err** (*error*) -

    検索エラー（存在する場合）。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

Get() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/column"
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

rs, err := cli.Get(ctx, milvusclient.NewQueryOption("quick_setup").
	WithIDs(column.NewColumnInt64("id", []int64{1, 2, 3})))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
