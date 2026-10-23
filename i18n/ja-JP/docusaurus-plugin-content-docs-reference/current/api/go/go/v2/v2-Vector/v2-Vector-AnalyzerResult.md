---
title: "AnalyzerResult | Go | v2"
slug: /go/go/v2-Vector-AnalyzerResult
sidebar_label: "AnalyzerResult"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "AnalyzerResult のインスタンスは、RunAnalyzer によって返されるテキストアナライザーのトークン化された出力を表します。各結果には、1 つの入力テキストから生成されたトークンが保持されます。 | Go | v2"
type: docx
token: UnYWdCXhjoKpCbxN8eEcYfB2neO
sidebar_position: 21
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソースのベクトルデータベース
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - AnalyzerResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AnalyzerResult

AnalyzerResult のインスタンスは、RunAnalyzer によって返されるテキストアナライザーのトークン化された出力を表します。各結果には、1 つの入力テキストから生成されたトークンが保持されます。

```go
type AnalyzerResult struct {
    Tokens []*Token
}
```

**フィールド：**

- **Text** (*string*) -

    トークンのテキストです。

- **StartOffset** (*int64*) -

    入力テキスト内におけるトークンの開始オフセットです。

- **EndOffset** (*int64*) -

    入力テキスト内におけるトークンの終了オフセットです。

- **Position** (*int64*) -

    トークンの位置です。

- **PositionLength** (*int64*) -

    トークン位置の長さです。

- **Hash** (*uint32*) -

    トークンのハッシュです。

## 例\{#example}

AnalyzerResult の使用例を示します。

```go
import (
	"context"

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

results, err := cli.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption([]string{"Milvus vector database"}))
if err != nil {
	// handle error
}
for _, result := range results {
	for _, token := range result.Tokens {
		fmt.Println(token.Text)
	}
}
```
