---
title: "RunAnalyzer | Go | v2"
slug: /go/go/v2-Vector-RunAnalyzer
sidebar_label: "RunAnalyzer"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会对输入文本运行文本 Analyzer，并返回分词后的输出。 | Go | v2"
type: docx
token: FMtsdyToloE8zxx6CR2cSycTndd
sidebar_position: 16
keywords: 
  - Zilliz
  - milvus 向量 Database
  - milvus Database
  - milvus 向量 Database
  - zilliz
  - zilliz 云
  - 云
  - RunAnalyzer
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RunAnalyzer

此操作会对输入文本运行文本 Analyzer，并返回分词后的输出。

```go
func (c *Client) RunAnalyzer(ctx context.Context, option RunAnalyzerOption, callOptions ...grpc.CallOption) ([]*entity.AnalyzerResult, error)
```

## 请求语法\{#request-syntax}

创建 RunAnalyzer() 的请求。

```go
option := milvusclient.NewRunAnalyzerOption(text).
    WithAnalyzerParamsStr(params).
    WithAnalyzerParams(params).
    WithDetail().
    WithHash().
    WithField(collectionName, fieldName).
    WithAnalyzerName(names)

result, err := client.RunAnalyzer(ctx, option)
```

**参数：**

- **text** (*...string*) -

    **[必需]**

    文本。

**构建器方法：**

- `NewRunAnalyzerOption(text ...string)`

    创建 RunAnalyzer() 的请求。

- `WithAnalyzerParamsStr(params string)`

    设置此操作的 Analyzer 参数字符串。

- `WithAnalyzerParams(params map[string]any)`

    设置此操作的 Analyzer 参数。

- `WithDetail()`

    设置此操作的详细信息。

- `WithHash()`

    设置此操作的哈希。

- `WithField(collectionName, fieldName string)`

    设置此操作的字段。

- `WithAnalyzerName(names ...string)`

    设置此操作的 Analyzer 名称。

**返回类型：**

<em>[]</em>entity.AnalyzerResult, error&ast;

**返回：**

Analyzer 输出以 Entity 结果的形式展示输入文本的分词方式。如果操作失败，则返回错误。

```go
type AnalyzerResult struct {
    Tokens []*Token
}
```

**参数：**

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

    token 的哈希。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RunAnalyzer() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
collectionName := "test_run_analyzer"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("pk").WithIsPrimaryKey(true).WithIsAutoID(true).WithDataType(entity.FieldTypeInt64)).
	WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(255).WithEnableAnalyzer(true).WithAnalyzerParams(map[string]any{"tokenizer": "standard"})).
	WithField(entity.NewField().WithName("sparse").WithDataType(entity.FieldTypeSparseVector)).
	WithFunction(entity.NewFunction().WithInputFields("text").WithOutputFields("sparse").WithType(entity.FunctionTypeBM25).WithName("bm25")).
	WithAutoID(true)

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema))
if err != nil {
	log.Fatal("failed to connect to create test collection: ", err.Error())
}

cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(collectionName, "sparse", index.NewAutoIndex(entity.BM25)).WithIndexName("bm25"))
cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption(collectionName))

// Run analyzer with loaded collection field (Must be bm25 function input)
result, err := cli.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption("test milvus").WithField(collectionName, "text"))
if err != nil {
	log.Fatal("failed to run analyzer with loaded collection field: ", err)
}

println("Run analyzer result with loaded collection field")
for _, token := range result[0].Tokens {
	println(token.Text)
}

params := map[string]any{
	"tokenizer": "standard",
	"filter": []any{map[string]any{
		"type":       "stop",
		"stop_words": []string{"test"}, // remove word "test"
	}},
}
// Run analyzer with new analyzer params
result, err = cli.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption("test milvus").WithAnalyzerParams(params))
if err != nil {
	log.Fatal("failed to run analyzer with new analyzer params: ", err)
}

println("Run analyzer with new analyzer params")
for _, token := range result[0].Tokens {
	println(token.Text)
}
```
