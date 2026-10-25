---
title: "SearchAggregation | Go | v2"
slug: /go/go/v2-Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、`Search()` のバケット集計の 1 レベルを記述します。`NewSearchAggregation()` を使用して集計仕様を作成し、`WithSearchAggregation()` を介して検索オプションに渡します。 | Go | v2"
type: docx
token: MSU5d8sIDonFYFxLv0Cc88dvnqL
sidebar_position: 25
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - SearchAggregation
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# SearchAggregation

この操作は、`Search()` のバケット集計の 1 レベルを記述します。`NewSearchAggregation()` を使用して集計仕様を作成し、`WithSearchAggregation()` を介して検索オプションに渡します。

```go
type SearchAggregation struct {
}
```

**ビルダーメソッド:**

- `WithSort(fieldName, direction string)`

    トップヒットの並べ替え条件を追加します。`direction` には `asc` または `desc` を指定します。

**メソッド:**

- `Validate() error`

## 例\{#example}

SearchAggregation の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

agg := milvusclient.NewSearchAggregation([]string{"category"}, 10).
	WithMetric("avg_score", "avg", "score").
	WithOrder("_count", "desc")

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
	"quick_setup",
	100,
	[]entity.Vector{entity.FloatVector{0.1, 0.2, 0.3}},
).WithSearchAggregation(agg))
if err != nil {
	// handle error
}
_ = resultSets
```
