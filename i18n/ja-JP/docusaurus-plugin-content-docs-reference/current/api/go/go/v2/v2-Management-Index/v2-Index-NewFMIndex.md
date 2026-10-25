---
title: "NewFMIndex | Go | v2"
slug: /go/go/v2-Index-NewFMIndex
sidebar_label: "NewFMIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、大規模なテキストコレクションに対する全文検索用の FM インデックス設定を作成します。 | Go | v2"
type: docx
token: Ssc4diNLwoorWTxbH6ecs2ZenAd
sidebar_position: 28
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - NewFMIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewFMIndex

この操作は、大規模なテキストコレクションに対する全文検索用の FM インデックス設定を作成します。

```go
func NewFMIndex() *FMIndex
```

## リクエスト構文\{#request-syntax}

FM インデックス設定を作成します。

```go
NewFMIndex() *FMIndex
```

**ビルダーメソッド:**

- `WithIndexName(name string) *FMIndex`

    インデックス名を設定します。

- `WithSaSampleRate(rate int) *FMIndex`

    サフィックス配列のサンプリングレートを設定します。

- `WithBlockBytes(blockBytes int) *FMIndex`

    ブロックサイズをバイト単位で設定します。

**戻り値の型:**

&ast;*FMIndex*

**戻り値:**

FM インデックス設定のインスタンスを返します。

**パラメーター:**

- **インデックス** (&ast;*FMIndex*) -

    FM インデックス設定のインスタンスです。インデックスオプションを介して CreateIndex() に渡します。

**エラー処理:**

- **error**

    検証、リクエスト構築、または RPC のいずれかが失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewFMIndex の使用方法を示します。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewFMIndex()))
if err != nil {
	// handle error
}
```
