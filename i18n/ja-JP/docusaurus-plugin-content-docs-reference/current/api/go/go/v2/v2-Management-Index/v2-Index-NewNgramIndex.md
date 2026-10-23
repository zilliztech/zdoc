---
title: "NewNgramIndex | Go | v2"
slug: /go/go/v2-Index-NewNgramIndex
sidebar_label: "NewNgramIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、テキストフィールド上に n-gram インデックス構成を作成し、テキストを minGram と maxGram で制限された重複する n-gram にトークン化して、部分文字列の一致を可能にします。 | Go | v2"
type: docx
token: L4Trd2cEUoe8zQxtAb8cDNr7nkc
sidebar_position: 32
keywords: 
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - 音声の類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - NewNgramIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewNgramIndex

この操作は、テキストフィールド上に n-gram インデックス構成を作成し、テキストを minGram と maxGram で制限された重複する n-gram にトークン化して、部分文字列の一致を可能にします。

```go
func NewNgramIndex(minGram, maxGram int) Index
```

## リクエスト構文\{#request-syntax}

指定された最小および最大のグラム長で n-gram インデックス構成を作成します。

```go
NewNgramIndex(minGram int, maxGram int) Index
```

**パラメーター:**

- **minGram** (*int*) -

    **[必須]**

- **maxGram** (*int*) -

    **[必須]**

**戻り値の型:**

[インデックス](./v2-Management-Index)

**戻り値:**

n-gram インデックス構成のインスタンスを返します。

**パラメーター:**

- **インデックス** ([インデックス](./v2-Management-Index)) -

    n-gram インデックス構成のインスタンスです。インデックスオプションを介して CreateIndex() に渡します。

**エラーハンドリング:**

- **error**

    検証、リクエストの構築、または RPC のいずれかが失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewNgramIndex の使用例を示します。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewNgramIndex(3, 8)))
if err != nil {
	// handle error
}
```
