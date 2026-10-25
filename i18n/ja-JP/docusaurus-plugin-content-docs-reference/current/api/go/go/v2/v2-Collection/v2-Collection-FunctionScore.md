---
title: "FunctionScore | Go | v2"
slug: /go/go/v2-Collection-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionScore インスタンスは、検索時の FunctionScore メッセージをモデル化します。このメッセージは、スコアリング関数のセット（Boost Ranker など）と、`boostmode` や `functionmode` などのスコアオプションパラメーターで構成されます。`WithFunctionScore()` を介して検索オプションに渡します。 | Go | v2"
type: docx
token: XNZ5dgPuHo1PD8xMlAycMzjxnrc
sidebar_position: 30
keywords: 
  - セマンティック検索
  - 異常検知
  - Sentence Transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - FunctionScore
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# FunctionScore

FunctionScore インスタンスは、検索時の FunctionScore メッセージをモデル化します。このメッセージは、スコアリング関数のセット（Boost Ranker など）と、`boost_mode` や `function_mode` などのスコアオプションパラメーターで構成されます。`WithFunctionScore()` を介して検索オプションに渡します。

```go
type FunctionScore struct {
    Functions []*Function
    Params map[string]string
}
```

**フィールド：**

- **Functions** (<em>[]</em>Function&ast;) -

    検索時に適用されるスコアリング関数です。

- **Params** (*map[string]string*) -

    boost_mode や function_mode などのスコアオプションパラメーターです。

**ビルダーメソッド：**

- `AddFunction(f *[Function](Function.md)) *FunctionScore`

    スコアにスコアリング関数を追加します。

- `WithParam(key string, value any) *FunctionScore`

    スコアオプションのパラメーターのキーと値のペアを設定し、値を文字列表現に変換します。

**メソッド：**

- `Clone() *FunctionScore`

    fs のディープコピーを返します。関数とパラメーターがコピーされるため、返されたスコアはソースと可変状態を共有しません。

## 例\{#example}

FunctionScore の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

rerank := entity.NewFunction().
	WithName("boost").
	WithType(entity.FunctionTypeRerank)

functionScore := entity.NewFunctionScore().AddFunction(rerank).
	WithParam("boost_mode", "sum").
	WithParam("function_mode", "multiply")

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors).
	WithFunctionScore(functionScore))
if err != nil {
	// handle error
}
```
