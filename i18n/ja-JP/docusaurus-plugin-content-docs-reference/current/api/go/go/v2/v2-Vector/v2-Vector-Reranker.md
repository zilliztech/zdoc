---
title: "Reranker | Go | v2"
slug: /go/go/v2-Vector-Reranker
sidebar_label: "Reranker"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Reranker インスタンスは、`HybridSearch()` に対する複数の ANN サブリクエストの結果を結合してランク付けします。インスタンスを作成するには、`NewRRFReranker()` または `NewWeightedReranker()` を使用します。 | Go | v2"
type: docx
token: TkDpdz2mHoZJojx0njDcdtDqnFg
sidebar_position: 24
keywords: 
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - zilliz
  - zilliz cloud
  - クラウド
  - Reranker
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Reranker

Reranker インスタンスは、`HybridSearch()` に対する複数の ANN サブリクエストの結果を結合してランク付けします。インスタンスを作成するには、`NewRRFReranker()` または `NewWeightedReranker()` を使用します。

```go
type Reranker interface {
    GetParams() []*commonpb.KeyValuePair
}
```

**ビルダーメソッド:**

- `NewRRFReranker()`

    Reciprocal Rank Fusion（RRF）Reranker を作成します。デフォルトの `k` は 60 です。

- `NewWeightedReranker(weights []float64)`

    ANN サブリクエストごとに 1 つの重みを持つ加重 Reranker を作成します。

**メソッド:**

- `GetParams() []*commonpb.KeyValuePair`

    リランク戦略とパラメーターをキーと値のペアとして返します。

- `WithK(k float64)`

    RRF の `k` 平滑化係数を設定します。

- `WithWeights(weights []float64)`

    ANN リクエスト順に、オプションの逆順位係数を設定します。サーバーでは空でないスライスが必要で、ANN リクエストごとに 1 つの値（[0, 1] 内）を指定します。nil と空のスライスは、サーバーがそれらを拒否できるようにシリアル化されます。

## 例\{#example}

Reranker の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
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

denseReq := milvusclient.NewAnnRequest("dense_vector", 10, denseVectors...)
sparseReq := milvusclient.NewAnnRequest("sparse_vector", 10, []entity.Vector{sparse}...)

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
	"quick_setup",
	10,
	denseReq, sparseReq,
).WithReranker(milvusclient.NewRRFReranker()))
if err != nil {
	log.Fatal("failed to perform hybrid search: ", err.Error())
}
_ = resultSets
```
