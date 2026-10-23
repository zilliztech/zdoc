---
title: "NewHNSWPQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWPQIndex
sidebar_label: "NewHNSWPQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロダクト量子化（HNSWPQ）を使用した HNSW インデックス構成を作成し、HNSW グラフ上でプロダクト量子化によってベクトルを圧縮します。 | Go | v2"
type: docx
token: CSCNdLVEGoURMaxD9iXcw11onhE
sidebar_position: 29
keywords: 
  - Chroma ベクトルデータベース
  - NLP 検索
  - LLM ハルシネーション
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - NewHNSWPQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWPQIndex

この操作は、プロダクト量子化（HNSW_PQ）を使用した HNSW インデックス構成を作成し、HNSW グラフ上でプロダクト量子化によってベクトルを圧縮します。

```go
func NewHNSWPQIndex(metricType MetricType, m int, efConstruction int, pqM int, nbits int) *hnswPQIndex
```

## リクエスト構文\{#request-syntax}

グラフパラメーター m と efConstruction、およびプロダクト量子化パラメーター pqM と nbits を使用して、HNSW_PQ インデックス構成を作成します。

```go
NewHNSWPQIndex(metricType MetricType, m int, efConstruction int, pqM int, nbits int) *hnswPQIndex
```

**パラメーター:**

- **metricType** ([MetricType](./v2-Management-MetricType)) -

    **[REQUIRED]**

- **m** (*int*) -

    **[REQUIRED]**

- **efConstruction** (*int*) -

    **[REQUIRED]**

- **pqM** (*int*) -

    **[REQUIRED]**

- **nbits** (*int*) -

    **[REQUIRED]**

**ビルダーメソッド:**

- `WithRefineType(refineType string) *hnswPQIndex`

    量子化された距離に適用する絞り込み戦略を設定します。

**戻り値の型:**

&ast;*hnswPQIndex*

**戻り値:**

HNSW_PQ インデックス構成のインスタンスを返します。

**パラメーター:**

- **インデックス** (&ast;*hnswPQIndex*) -

    HNSW_PQ インデックス構成のインスタンスです。インデックスオプションを介して CreateIndex() に渡します。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返された error を確認してください。

## 例\{#example}

NewHNSWPQIndex の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWPQIndex(entity.MetricTypeL2, 16, 200, 8, 8)))
if err != nil {
	// handle error
}
```
