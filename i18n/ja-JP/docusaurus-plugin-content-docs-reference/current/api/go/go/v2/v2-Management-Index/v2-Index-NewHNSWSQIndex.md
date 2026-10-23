---
title: "NewHNSWSQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWSQIndex
sidebar_label: "NewHNSWSQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スカラー量子化（HNSWSQ）を使用した HNSW インデックス設定を作成し、HNSW グラフ上でスカラー量子化によってベクトルを圧縮します。 | Go | v2"
type: docx
token: DF4UdECmLoD4mkxNi8scrntlnmf
sidebar_position: 31
keywords: 
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - NewHNSWSQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWSQIndex

この操作は、スカラー量子化（HNSW_SQ）を使用した HNSW インデックス設定を作成し、HNSW グラフ上でスカラー量子化によってベクトルを圧縮します。

```go
func NewHNSWSQIndex(metricType MetricType, m int, efConstruction int, sqType string) *hnswSQIndex
```

## リクエスト構文\{#request-syntax}

グラフパラメーター m と efConstruction、およびスカラー量子化タイプ sqType を指定して、HNSW_SQ インデックス設定を作成します。

```go
NewHNSWSQIndex(metricType MetricType, m int, efConstruction int, sqType string) *hnswSQIndex
```

**パラメーター:**

- **metricType** ([MetricType](./v2-Management-MetricType)) -

    **[REQUIRED]**

- **m** (*int*) -

    **[REQUIRED]**

- **efConstruction** (*int*) -

    **[REQUIRED]**

- **sqType** (*string*) -

    **[REQUIRED]**

**ビルダーメソッド:**

- `WithRefineType(refineType string) *hnswSQIndex`

    量子化された距離に適用するリファインメント戦略を設定します。

**戻り値の型:**

&ast;*hnswSQIndex*

**戻り値:**

HNSW_SQ インデックス設定のインスタンスを返します。

**パラメーター:**

- **インデックス** (&ast;*hnswSQIndex*) -

    HNSW_SQ インデックス設定のインスタンスです。インデックスオプションを介して CreateIndex() に渡します。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewHNSWSQIndex の使用例を示します。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWSQIndex(entity.MetricTypeL2, 16, 200, "SQ8")))
if err != nil {
	// handle error
}
```
