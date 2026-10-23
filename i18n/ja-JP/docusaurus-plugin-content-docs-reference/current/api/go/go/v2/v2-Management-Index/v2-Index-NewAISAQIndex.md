---
title: "NewAISAQIndex | Go | v2"
slug: /go/go/v2-Index-NewAISAQIndex
sidebar_label: "NewAISAQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ベクトルフィールドの AISAQ インデックス構成を作成します。AISAQ は転置ファイル構成と、プロダクト量子化による補助ストレージを組み合わせており、ビルダーメソッドを通じて調整できます。 | Go | v2"
type: docx
token: DIoqdCpn0o0y2sxi2QtcIGsynbc
sidebar_position: 27
keywords: 
  - what is milvus
  - milvus データベース
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - NewAISAQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAISAQIndex

この操作は、ベクトルフィールドの AISAQ インデックス構成を作成します。AISAQ は転置ファイル構成と、プロダクト量子化による補助ストレージを組み合わせており、ビルダーメソッドを通じて調整できます。

```go
func NewAISAQIndex(metricType MetricType) *aisaqIndex
```

## リクエスト構文\{#request-syntax}

指定されたメトリックタイプで AISAQ インデックス構成を作成します。

```go
NewAISAQIndex(metricType MetricType) *aisaqIndex
```

**パラメーター:**

- **metricType** ([MetricType](./v2-Management-MetricType)) -

    **[REQUIRED]**

**ビルダーメソッド:**

- `WithInlinePQ(inlinePQ int) *aisaqIndex`

    インラインのプロダクト量子化レベルを設定します。

- `WithNumEntryPoints(numEntryPoints int) *aisaqIndex`

    エントリポイントの数を設定します。

- `WithPQCacheSize(bytes int) *aisaqIndex`

    プロダクト量子化のキャッシュサイズをバイト単位で設定します。

- `WithPQReadIOEngine(engine string) *aisaqIndex`

    プロダクト量子化の読み取りに使用する IO エンジンを設定します。

- `WithPQReadPageCacheSize(bytes int) *aisaqIndex`

    プロダクト量子化の読み取りに使用するページキャッシュのサイズを設定します。

- `WithRearrange(rearrange bool) *aisaqIndex`

    データの再配置を有効にするかどうかを設定します。

**戻り値の型:**

&ast;*aisaqIndex*

**戻り値:**

AISAQ インデックス構成のインスタンスを返します。

**パラメーター:**

- **インデックス** (&ast;*aisaqIndex*) -

    AISAQ インデックス構成のインスタンスです。インデックスオプションを介して CreateIndex() に渡します。

**エラー処理:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewAISAQIndex の使用例を示します。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewAISAQIndex(entity.MetricTypeIP)))
if err != nil {
	// handle error
}
```
