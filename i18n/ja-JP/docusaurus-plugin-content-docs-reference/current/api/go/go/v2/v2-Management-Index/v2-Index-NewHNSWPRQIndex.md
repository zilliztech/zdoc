---
title: "NewHNSWPRQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWPRQIndex
sidebar_label: "NewHNSWPRQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロダクト残差量子化（HNSWPRQ）を使用する HNSW インデックス構成を作成し、残差量子化ステージで圧縮距離を精緻化します。 | Go | v2"
type: docx
token: NBFFdeNtcoQFP4xUj3vccXWGnJe
sidebar_position: 30
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - NewHNSWPRQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWPRQIndex

この操作は、プロダクト残差量子化（HNSW_PRQ）を使用する HNSW インデックス構成を作成し、残差量子化ステージで圧縮距離を精緻化します。

```go
func NewHNSWPRQIndex(metricType MetricType, m int, efConstruction int, pqM int, nrq int, nbits int) *hnswPRQIndex
```

## リクエスト構文\{#request-syntax}

グラフパラメーター m と efConstruction、プロダクト量子化パラメーター pqM、残差量子化パラメーター nrq と nbits を使用して、HNSW_PRQ インデックス構成を作成します。

```go
NewHNSWPRQIndex(metricType MetricType, m int, efConstruction int, pqM int, nrq int, nbits int) *hnswPRQIndex
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

- **nrq** (*int*) -

    **[REQUIRED]**

- **nbits** (*int*) -

    **[REQUIRED]**

**ビルダーメソッド:**

- `WithRefineType(refineType string) *hnswPRQIndex`

    量子化距離に適用するリファインメント戦略を設定します。

**戻り値の型:**

&ast;*hnswPRQIndex*

**戻り値:**

HNSW_PRQ インデックス構成のインスタンスを返します。

**パラメーター:**

- **インデックス** (&ast;*hnswPRQIndex*) -

    HNSW_PRQ インデックス構成のインスタンスです。インデックスオプションを介して CreateIndex() に渡します。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewHNSWPRQIndex の使用例を示します。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWPRQIndex(entity.MetricTypeL2, 16, 200, 8, 2, 8)))
if err != nil {
	// handle error
}
```
