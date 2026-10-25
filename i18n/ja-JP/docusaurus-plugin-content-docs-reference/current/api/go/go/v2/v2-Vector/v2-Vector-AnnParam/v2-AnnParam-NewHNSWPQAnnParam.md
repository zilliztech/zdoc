---
title: "NewHNSWPQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewHNSWPQAnnParam
sidebar_label: "NewHNSWPQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、HNSW 量子化インデックスファミリー（HNSWSQ、HNSWPQ、HNSWPRQ）で共有される検索パラメーター構成を作成し、量子化 HNSW インデックスの検索時の動作を調整します。NewHNSWPRQAnnParam() と NewHNSWSQAnnParam() は、同じビルダーメソッドを持つ同じ型の構成を返します。 | Go | v2"
type: docx
token: Fq1YdfEGFof2dixygELcgaomnrb
sidebar_position: 12
keywords: 
  - 機械学習
  - RAG
  - NLP
  - ニューラルネットワーク
  - zilliz
  - zilliz cloud
  - cloud
  - NewHNSWPQAnnParam
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewHNSWPQAnnParam

この操作は、HNSW 量子化インデックスファミリー（HNSW_SQ、HNSW_PQ、HNSW_PRQ）で共有される検索パラメーター構成を作成し、量子化 HNSW インデックスの検索時の動作を調整します。NewHNSWPRQAnnParam() と NewHNSWSQAnnParam() は、同じビルダーメソッドを持つ同じ型の構成を返します。

```go
func NewHNSWPQAnnParam(ef int) *hnswQuantAnnParam
```

## リクエスト構文\{#request-syntax}

指定された検索エフォート ef を使用して、量子化 HNSW 検索パラメーター構成を作成します。

```go
NewHNSWPQAnnParam(ef int) *hnswQuantAnnParam
```

**パラメーター:**

- **ef** (*int*) -

    **[REQUIRED]**

**ビルダーメソッド:**

- `WithRefineK(refineK float64) *hnswQuantAnnParam`

    量子化された候補距離に適用するリファインメント係数を設定します。

- `WithSeedEf(seedEf int) *hnswQuantAnnParam`

    グラフ検索をウォームアップするために使用するシード検索エフォートを設定します。

- `Params() map[string]any`

    現在の検索パラメーターをマップとして返します。

**戻り値の型:**

&ast;*hnswQuantAnnParam*

**戻り値:**

量子化 HNSW 検索パラメーター構成を返します。

**パラメーター:**

- **annParam** (&ast;*hnswQuantAnnParam*) -

    量子化 HNSW 検索パラメーター構成です。WithAnnParam() を介して検索オプションまたはハイブリッド検索オプションに渡します。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewHNSWPQAnnParam の使用例を示します。

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

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors).
	WithAnnParam(index.NewHNSWPQAnnParam(64)))
if err != nil {
	// handle error
}
```
