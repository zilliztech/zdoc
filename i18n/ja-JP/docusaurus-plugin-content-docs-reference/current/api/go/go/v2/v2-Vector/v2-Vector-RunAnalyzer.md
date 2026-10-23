---
title: "RunAnalyzer | Go | v2"
slug: /go/go/v2-Vector-RunAnalyzer
sidebar_label: "RunAnalyzer"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、入力テキストに対してテキストアナライザーを実行し、トークン化された出力を返します。 | Go | v2"
type: docx
token: FMtsdyToloE8zxx6CR2cSycTndd
sidebar_position: 15
keywords: 
  - Zilliz
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - RunAnalyzer
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RunAnalyzer

この操作は、入力テキストに対してテキストアナライザーを実行し、トークン化された出力を返します。

```go
func (c *Client) RunAnalyzer(ctx context.Context, option RunAnalyzerOption, callOptions ...grpc.CallOption) ([]*entity.AnalyzerResult, error)
```

## リクエスト構文\{#request-syntax}

RunAnalyzer() のリクエストを作成します。

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

**パラメーター：**

- **text** (*...string*) -

    **[REQUIRED]**

    テキストです。

**ビルダーメソッド：**

- `NewRunAnalyzerOption(text ...string)`

    RunAnalyzer() のリクエストを作成します。

- `WithAnalyzerParamsStr(params string)`

    この操作のアナライザーパラメーター文字列を設定します。

- `WithAnalyzerParams(params map[string]any)`

    この操作のアナライザーパラメーターを設定します。

- `WithDetail()`

    この操作の詳細を設定します。

- `WithHash()`

    この操作のハッシュを設定します。

- `WithField(collectionName, fieldName string)`

    この操作のフィールドを設定します。

- `WithAnalyzerName(names ...string)`

    この操作のアナライザー名を設定します。

**戻り値の型：**

<em>[]</em>entity.AnalyzerResult, error&ast;

**戻り値：**

入力テキストがどのようにトークン化されるかを示すアナライザーの出力です。操作が失敗した場合は、エラーを返します。

```go
type AnalyzerResult struct {
    Tokens []*Token
}
```

**パラメーター：**

- **Text** (*string*) -

    トークンのテキストです。

- **StartOffset** (*int64*) -

    入力テキスト内のトークンの開始オフセットです。

- **EndOffset** (*int64*) -

    入力テキスト内のトークンの終了オフセットです。

- **Position** (*int64*) -

    トークンの位置です。

- **PositionLength** (*int64*) -

    トークン位置の長さです。

- **Hash** (*uint32*) -

    トークンのハッシュです。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RunAnalyzer() の使用方法を示します。

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
