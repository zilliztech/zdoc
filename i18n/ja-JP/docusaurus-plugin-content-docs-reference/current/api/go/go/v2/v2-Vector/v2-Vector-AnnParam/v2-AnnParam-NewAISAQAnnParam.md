---
title: "NewAISAQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewAISAQAnnParam
sidebar_label: "NewAISAQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、AISAQ インデックスの検索時の動作を調整する AISAQ 検索パラメーター構成を作成します。 | Go | v2"
type: docx
token: D61ndr0TSocZRbxxLnRcfXr3nVg
sidebar_position: 11
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - NewAISAQAnnParam
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewAISAQAnnParam

この操作は、AISAQ インデックスの検索時の動作を調整する AISAQ 検索パラメーター構成を作成します。

```go
func NewAISAQAnnParam(searchList int) *aisaqAnnParam
```

## リクエスト構文\{#request-syntax}

指定された検索リストの長さで AISAQ 検索パラメーター構成を作成します。

```go
NewAISAQAnnParam(searchList int) *aisaqAnnParam
```

**パラメーター:**

- **searchList** (*int*) -

    **[必須]**

**ビルダーメソッド:**

- `WithBeamwidth(beamwidth int) *aisaqAnnParam`

    検索ビーム幅を設定します。

- `WithPQReadPageCacheSize(bytes int) *aisaqAnnParam`

    プロダクト量子化の読み取りに使用するページキャッシュのサイズを設定します。

- `WithVectorsBeamwidth(beamwidth int) *aisaqAnnParam`

    ベクトル読み取りに使用するビーム幅を設定します。

- `Params() map[string]any`

    現在の検索パラメーターをマップとして返します。

**戻り値の型:**

&ast;*aisaqAnnParam*

**戻り値:**

AISAQ 検索パラメーター構成を返します。

**パラメーター:**

- **annParam** (&ast;*aisaqAnnParam*) -

    AISAQ 検索パラメーター構成です。WithAnnParam() を使用して、検索オプションまたはハイブリッド検索オプションに渡します。

**エラーハンドリング:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewAISAQAnnParam の使用例を示します。

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
	WithAnnParam(index.NewAISAQAnnParam(64)))
if err != nil {
	// handle error
}
```
