---
title: "NewHNSWSQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewHNSWSQAnnParam
sidebar_label: "NewHNSWSQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、HNSWSQ インデックス用の検索パラメーター構成を作成し、スカラー量子化された HNSW グラフの検索時の動作を調整します。 | Go | v2"
type: docx
token: EYsfdEOCqow86txk8EUcXRB6ndf
sidebar_position: 14
keywords: 
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - NewHNSWSQAnnParam
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWSQAnnParam

この操作は、HNSW_SQ インデックスの検索パラメーター構成を作成し、スカラー量子化された HNSW グラフの検索時の動作を調整します。

```go
func NewHNSWSQAnnParam(ef int) *hnswQuantAnnParam
```

## リクエスト構文\{#request-syntax}

指定された検索エフォート ef を使用して、量子化 HNSW の検索パラメーター構成を作成します。

```go
NewHNSWSQAnnParam(ef int) *hnswQuantAnnParam
```

**パラメーター:**

- **ef** (*int*) -

    **[必須]**

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

量子化 HNSW の検索パラメーター構成を返します。

**パラメーター:**

- **annParam** (&ast;*hnswQuantAnnParam*) -

    量子化 HNSW の検索パラメーター構成です。WithAnnParam() を介して、検索またはハイブリッド検索のオプションに渡します。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewHNSWSQAnnParam の使用方法を示します。

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
	WithAnnParam(index.NewHNSWSQAnnParam(64)))
if err != nil {
	// handle error
}
```
