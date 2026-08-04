---
title: "Insert() | Go | v2"
slug: /go/go/v2-Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "行または列を挿入し、struct-array 入力をサポートし、この操作のクライアントテレメトリを記録します。 | Go | v2"
type: docx
token: NQsbdUsP8oIAbOxSnEEcKUBMnkg
sidebar_position: 11
keywords: 
  - ベクトルデータベース チュートリアル
  - ベクトルデータベース 仕組み
  - vector db comparison
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

行または列を挿入し、struct-array 入力をサポートし、この操作のクライアントテレメトリを記録します。

```go
func (c *Client) Insert(ctx context.Context, option InsertOption, callOptions ...grpc.CallOption) (InsertResult, error)
```

**パラメータ:**

- **collName** (*string*) -

    **[必須]**

    対象 collection の名前です。

- **rows** (*...any*) -

    **[必須]**

    挿入する 1 つ以上の行の値です。

**ビルダーメソッド:**

- `WithColumns(columns ...column.Column)`

    指定された列を write リクエストに追加します。

- `WithBoolColumn(colName string, data []bool)`

    指定された名前と値を持つ Boolean scalar 列を追加します。

- `WithInt8Column(colName string, data []int8)`

    指定された名前と値を持つ Int8 scalar 列を追加します。

- `WithInt16Column(colName string, data []int16)`

    指定された名前と値を持つ Int16 scalar 列を追加します。

- `WithInt32Column(colName string, data []int32)`

    指定された名前と値を持つ Int32 scalar 列を追加します。

- `WithInt64Column(colName string, data []int64)`

    指定された名前と値を持つ Int64 scalar 列を追加します。

- `WithVarcharColumn(colName string, data []string)`

    指定された名前と値を持つ VarChar scalar 列を追加します。

- `WithFloatVectorColumn(colName string, dim int, data [][]float32)`

    指定された名前、次元、および値を持つ float-vector 列を追加します。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定された float32 vector を Float16 値に変換し、結果の vector 列を追加します。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定された float32 vector を BFloat16 値に変換し、結果の vector 列を追加します。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    指定された名前、次元、および値を持つ binary-vector 列を追加します。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    指定された名前、次元、および値を持つ Int8-vector 列を追加します。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    行ベースのサブフィールド値から構築された struct-array 列を追加します。各行はサブフィールド名をキーとする map であり、各値は `structSchema` で宣言された scalar または vector 型と一致する必要があります。

- `WithPartition(partitionName string)`

    write リクエストの対象 partition を設定します。

- `WithNamespace(namespace string)`

    WithNamespace は write を collection namespace にスコープします。delete/upsert tombstone に対する primary key は依然として collection スコープであるため、呼び出し元は同じ collection 内の namespace 間で primary key が一意になるように維持する必要があります。

- `WithPartialUpdate(partialUpdate bool)`

    write リクエストの partial-update 動作を有効または無効にします。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend は、Upsert 中に Array フィールド `fieldName` を ARRAY_APPEND セマンティクスでマージする必要があることを宣言します。非 `REPLACE` 操作が存在する場合、サーバーは暗黙的に `partial_update` を有効にするため、呼び出し元が `WithPartialUpdate(true)` を追加で呼び出す必要はありません。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove は、Upsert 中に Array フィールド `fieldName` を ARRAY_REMOVE セマンティクスでマージする必要があることを宣言します。暗黙的な `partial_update` への昇格については `WithArrayAppend` を参照してください。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp は、名前 `fieldName` を持つフィールドに明示的な `FieldPartialUpdateOp` を付加します。高度な利用者向けであり、通常の利用者は操作固有のヘルパー（`WithArrayAppend`、`WithArrayRemove`）を使用することを推奨します。

- `WithKeepAutoIDPk(keepPk bool)`

    行ベースの write で、自動 ID 生成が有効な場合に指定された primary-key 値を保持するかどうかを制御します。

**戻り値の型:**

*InsertResult, error*

**戻り値:**

挿入された行数と、生成または指定された primary key を返します。加えて、リクエストの構築または RPC が失敗した場合は error を返します。

**エラーハンドリング:**

- **error**

    検証、リクエスト構築、または RPC が失敗します。失敗の詳細は返された error を確認してください。

## Example\{#example}

Insert() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256))
rows := []map[string]any{{"text": []string{"first", "second"}}}

result, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("books").
	WithInt64Column("id", []int64{1}).
	WithStructArrayColumn("chunks", structSchema, rows))
if err != nil {
	// handle error
}
_ = result
```
