---
title: "Insert() | Go | v2"
slug: /go/go/v2-Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、1 つ以上のエンティティを collection に挿入します。 | Go | v2"
type: docx
token: T6S4dcpZ7oeKD6xeTofc2mn9nrb
sidebar_position: 6
keywords: 
  - vector database チュートリアル
  - vector databases はどのように動作するか
  - vector db 比較
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - Insert()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Insert()

この操作は、1 つ以上のエンティティを collection に挿入します。

```go
func (c *Client) Insert(ctx context.Context, option InsertOption, callOptions ...grpc.CallOption) (InsertResult, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewColumnBasedInsertOption(collName).
	WithInt64Column(colName, data).
	WithVarcharColumn(colName, data).
	WithFloatVectorColumn(colName, dim, data).
	WithBinaryVectorColumn(colName, dim, data).
	WithBoolColumn(colName, data).
	WithStructArrayColumn(colName, structSchema, rows).
	WithPartition(partitionName)

// Alternative (row-based):
// option := milvusclient.NewRowBasedInsertOption(collName, rows...)

result, err := client.Insert(ctx, option)
```

**パラメーター:**

- **collName** (*string*)

対象の collection の名前。

**オプションメソッド:**

- `WithColumns(columns ...column.Column)`

    任意の型付き列を挿入します。

- `WithBoolColumn(colName string, data []bool)`

    boolean 値の列を挿入します。

- `WithInt8Column(colName string, data []int8)`

    int8 値の列を挿入します。

- `WithInt16Column(colName string, data []int16)`

    int16 値の列を挿入します。

- `WithInt32Column(colName string, data []int32)`

    int32 値の列を挿入します。

- `WithInt64Column(colName string, data []int64)`

    int64 値の列を挿入します。

- `WithVarcharColumn(colName string, data []string)`

    文字列値の列を挿入します。

- `WithFloatVectorColumn(colName string, dim int, data [][]float32)`

    float32 dense vector の列を挿入します。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    float16 vector の列を挿入します（float32 から変換）。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    bfloat16 vector の列を挿入します（float32 から変換）。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    binary vector の列を挿入します。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    int8 vector の列を挿入します。

- `WithPartition(partitionName string)`

    挿入操作の対象として特定の partition を指定します。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    行ごとの map から構築された struct-array 列を挿入します。各行の map は struct のサブフィールド名をキーとして使用します。scalar サブフィールドには `[]int32` や `[]string` などのスライスを使用し、vector サブフィールドには `[][]float32`、`[][]byte`、`[][]int8` などのネストされたスライスを使用します。

**戻り値の型:**

*[InsertResult](./v2-Vector-InsertResult), error*

**戻り値:**

新しく挿入されたエンティティの ID を含む挿入結果です。操作が失敗した場合は error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

resp, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("quick_setup").
	WithInt64Column("id", []int64{1, 2, 3, 4, 5, 6, 7, 8, 9}).
	WithVarcharColumn("color", []string{"pink_8682", "red_7025", "orange_6781", "pink_9298", "red_4794", "yellow_4222", "red_9392", "grey_8510", "white_9381", "purple_4976"}).
	WithFloatVectorColumn("vector", 5, [][]float32{
		{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
		{0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104},
		{0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592},
		{0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345},
		{0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106},
		{0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955},
		{0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987},
		{-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052},
		{0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336},
		{0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608},
	}),
)
if err != nil {
	// handle err
}
fmt.Println(resp)
```
