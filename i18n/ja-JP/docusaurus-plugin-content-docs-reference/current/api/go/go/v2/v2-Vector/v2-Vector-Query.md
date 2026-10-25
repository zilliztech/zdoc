---
title: "Query | Go | v2"
slug: /go/go/v2-Vector-Query
sidebar_label: "Query"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ブールフィルター式に一致するエンティティを取得します。 | Go | v2"
type: docx
token: KwEzdcoZ6o2rkgxUAp4ct66nnDf
sidebar_position: 13
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - クラウド
  - Query
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Query

この操作は、ブールフィルター式に一致するエンティティを取得します。

```go
func (c *Client) Query(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## リクエスト構文\{#request-syntax}

Query() のリクエストを作成します。

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

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewQueryOption(collectionName string)`

    Query() のリクエストを作成します。

- `WithFilter(expr string)`

    ブールフィルター式を適用して結果を絞り込みます。

- `WithTemplateParam(key string, val any)`

    式の評価に使用するテンプレートパラメーターを設定します。

- `WithOffset(offset int)`

    一致する結果を返す前にスキップする結果数を設定します。

- `WithLimit(limit int)`

    返す結果の最大数を設定します。

- `WithOutputFields(fieldNames ...string)`

    返される結果に含めるフィールドを指定します。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](../Collection/ConsistencyLevel.md))`

    操作の整合性レベル（Strong、Bounded、Session、Eventually のいずれか）を設定します。

- `WithPartitions(partitionNames ...string)`

    操作を指定したパーティションに限定します。

- `WithNamespace(namespace string)`

    クエリのスコープをコレクションの名前空間に限定します。

- `WithOrderByFields(fields ...string)`

    指定されたスカラーフィールドでクエリ結果を並べ替えます。各指定は `fieldName` または `fieldName:asc` / `fieldName:desc`（デフォルトは昇順）です。並べ替えフィールドを設定する場合、サーバーでは明示的な limit の指定が必要です。

- `WithIDs(ids column.Column)`

    操作の ID を設定します。

**戻り値の型:**

*ResultSet, error*

**戻り値:**

検索またはクエリの結果には、一致したエンティティがスコアおよびフィールドとともに含まれます。操作が失敗した場合はエラーを返します。

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

    返されたエントリの数です。

- **GroupByValue** (*column.Column*) -

    検索/query でグループ化を使用した場合の、グループ化列の値です。

- **IDs** (*column.Column*) -

    一致したエンティティの主キー列です。

- **Fields** (*DataSet*) -

    出力フィールドの列です。

- **AggregationBuckets** (*[]AggregationBucket*) -

    集計が要求された場合の、このクエリの検索集計結果です。

- **Scores** (*[]float32*) -

    各一致結果とターゲットベクトルとの距離です。

- **Recall** (*float32*) -

    検索結果の推定再現率です（Zilliz Cloud による推定）。

- **Err** (*error*) -

    検索エラーがある場合は、そのエラーです。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

Query() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

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

rs, err := cli.Query(ctx, milvusclient.NewQueryOption("quick_setup").
	WithFilter("emb_type == 3").
	WithOutputFields("id", "emb_type"))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
