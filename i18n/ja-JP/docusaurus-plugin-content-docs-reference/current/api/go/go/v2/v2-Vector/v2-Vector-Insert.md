---
title: "Insert() | Go | v2"
slug: /go/go/v2-Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は行または列を挿入し、構造体配列の入力に対応し、操作のクライアントテレメトリを記録します。 | Go | v2"
type: docx
token: NQsbdUsP8oIAbOxSnEEcKUBMnkg
sidebar_position: 11
keywords: 
  - ベクトル データベース tutorial
  - how do ベクトル データベース work
  - ベクトル db comparison
  - openai ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - Insert()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Insert()

この操作は行または列を挿入し、構造体配列の入力に対応し、操作のクライアントテレメトリを記録します。

```go
func (c *Client) Insert(ctx context.Context, option InsertOption, callOptions ...grpc.CallOption) (InsertResult, error)
```

## Request Syntax\{#request-syntax}

Insert() のリクエストを作成します。

```go
result, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("books").
	WithInt64Column("id", []int64{1}).
	WithStructArrayColumn("chunks", structSchema, rows))
```

**PARAMETERS:**

- **collName** (*string*) -

    **[REQUIRED]**

    対象コレクションの名前です。

- **rows** (*...any*) -

    **[REQUIRED]**

    挿入する1つ以上の行値です。

**BUILDER METHODS:**

- `NewColumnBasedInsertOption(collName string, columns ...column.Column)`

    列から挿入オプションを作成します。リクエストは、以下の `With*Column` メソッドを使用して構築します。

- `NewRowBasedInsertOption(collName string, rows ...any)`

    行値から挿入オプションを作成します。`WithPartition`、`WithNamespace`、`WithPartialUpdate`、`WithArrayAppend`、`WithArrayRemove`、`WithFieldPartialOp`、または `WithKeepAutoIDPk` をチェーンします。

- `WithColumns(columns ...column.Column)`

    指定した列を書き込みリクエストに追加します。

- `WithBoolColumn(colName string, data []bool)`

    指定した名前と値を持つ Boolean スカラー列を追加します。

- `WithInt8Column(colName string, data []int8)`

    指定した名前と値を持つ Int8 スカラー列を追加します。

- `WithInt16Column(colName string, data []int16)`

    指定した名前と値を持つ Int16 スカラー列を追加します。

- `WithInt32Column(colName string, data []int32)`

    指定した名前と値を持つ Int32 スカラー列を追加します。

- `WithInt64Column(colName string, data []int64)`

    指定した名前と値を持つ Int64 スカラー列を追加します。

- `WithVarcharColumn(colName string, data []string)`

    指定した名前と値を持つ VarChar スカラー列を追加します。

- `WithTextColumn(colName string, data []string)`

    指定した名前と値を持つ Text スカラー列を追加します。

- `WithFloatVectorColumn(colName string, dim int, data [][]float32)`

    指定した名前、次元、値を持つ float-ベクトル 列を追加します。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定した float32 ベクトルを Float16 値に変換し、結果として得られたベクトル列を追加します。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定した float32 ベクトルを BFloat16 値に変換し、結果として得られたベクトル列を追加します。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    指定した名前、次元、値を持つ binary-ベクトル 列を追加します。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    指定した名前、次元、値を持つ Int8-ベクトル 列を追加します。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    行ベースのサブフィールド値から構築された構造体配列列を追加します。各行はサブフィールド名をキーとするマップであり、各値は structSchema で宣言されたスカラー型またはベクトル型と一致する必要があります。

- `WithPartition(partitionName string)`

    書き込みリクエストの対象パーティションを設定します。

- `WithNamespace(namespace string)`

    WithNamespace は、書き込みをコレクション名前空間にスコープします。プライマリキーは delete/upsert のトゥームストーンに対して引き続きコレクションスコープであるため、呼び出し元は同じコレクション内の名前空間全体でプライマリキーを一意に保つ必要があります。

- `WithPartialUpdate(partialUpdate bool)`

    書き込みリクエストの部分更新動作を有効または無効にします。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend は、Array フィールド `fieldName` を Upsert 中に ARRAY_APPEND セマンティクスでマージすることを宣言します。REPLACE 以外の操作が存在する場合、サーバーは暗黙的に partial_update を有効にするため、呼び出し元が WithPartialUpdate(true) をさらに呼び出す必要はありません。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove は、Array フィールド `fieldName` を Upsert 中に ARRAY_REMOVE セマンティクスでマージすることを宣言します。暗黙的な partial_update のプロモーションについては、WithArrayAppend を参照してください。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp は、明示的な FieldPartialUpdateOp を `fieldName` という名前のフィールドにアタッチします。上級の呼び出し元向けです。通常のユーザーは、操作固有のヘルパー（WithArrayAppend、WithArrayRemove）を優先してください。

- `WithKeepAutoIDPk(keepPk bool)`

    自動 ID 生成が有効な場合に、行ベースの書き込みが指定されたプライマリキー値を保持するかどうかを制御します。

**RETURN TYPE:**

*InsertResult, error*

**RETURNS:**

挿入された行数と、生成または指定されたプライマリキーを返します。また、リクエストの構築または RPC に失敗した場合は、エラーを返します。

```go
type InsertResult struct {
    InsertCount int64
    IDs column.Column
}
```

**PARAMETERS:**

- **InsertCount** (*int64*) -

    影響を受けたエンティティの数です。

- **IDs** (*column.Column*) -

    影響を受けたエンティティの ID です。

**ERROR HANDLING:**

- **error**

    操作が失敗します。検証、リクエストの構築、または RPC に失敗します。失敗の詳細については、返されたエラーを確認してください。

## Example\{#example}

Insert() の使用例を示します。

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
