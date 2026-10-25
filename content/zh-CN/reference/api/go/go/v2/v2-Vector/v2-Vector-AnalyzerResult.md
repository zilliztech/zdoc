---
title: "AnalyzerResult | Go | v2"
slug: /go/go/v2-Vector-AnalyzerResult
sidebar_label: "AnalyzerResult"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "AnalyzerResult 实例表示文本 Analyzer 的分词输出，由 RunAnalyzer 返回。每个结果包含从一段输入文本中生成的 token。 | Go | v2"
type: docx
token: UnYWdCXhjoKpCbxN8eEcYfB2neO
sidebar_position: 22
keywords: 
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - AnalyzerResult
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AnalyzerResult

AnalyzerResult 实例表示文本 Analyzer 的分词输出，由 RunAnalyzer 返回。每个结果包含从一段输入文本中生成的 token。

```go
type AnalyzerResult struct {
    Tokens []*Token
}
```

**字段：**

- **Text** (*string*) -

    token 的文本。

- **StartOffset** (*int64*) -

    token 在输入文本中的起始偏移量。

- **EndOffset** (*int64*) -

    token 在输入文本中的结束偏移量。

- **Position** (*int64*) -

    token 的位置。

- **PositionLength** (*int64*) -

    token 位置的长度。

- **Hash** (*uint32*) -

    token 的哈希值。

## 示例\{#example}

演示 AnalyzerResult 的用法。

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
