---
title: "Upsert() | Go | v2"
slug: /go/go/v2-Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、struct-array およびフィールドレベルの配列操作を使用して行または列をアップサートし、この操作のクライアントテレメトリを記録します。 | Go | v2"
type: docx
token: PB5kdtzs8ok748xwRWacJbEUnze
sidebar_position: 18
keywords: 
  - milvus ベクトルデータベース
  - milvus DB
  - milvus ベクトル DB
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - Upsert()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Upsert()

この操作は、struct-array およびフィールドレベルの配列操作を使用して行または列をアップサートし、この操作のクライアントテレメトリを記録します。

```go
func (c *Client) Upsert(ctx context.Context, option UpsertOption, callOptions ...grpc.CallOption) (UpsertResult, error)
```

## リクエスト構文\{#request-syntax}

Upsert() のリクエストを作成します。

```go
result, err := cli.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("books").
	WithInt64Column("id", []int64{1}).
	WithVarcharColumn("tags", []string{"featured"}).
	WithArrayAppend("tags"))
```

**パラメーター:**

- **collName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **rows** (*...any*) -

    **[必須]**

    挿入または更新する 1 つ以上の行の値です。

**ビルダーメソッド:**

- `NewColumnBasedInsertOption(collName string, columns ...column.Column)`

    列からアップサートオプションを作成します。以下の `With*Column` メソッドでリクエストを構築します。

- `NewRowBasedInsertOption(collName string, rows ...any)`

    行値からアップサートオプションを作成します。`WithPartition`、`WithNamespace`、`WithPartialUpdate`、`WithArrayAppend`、`WithArrayRemove`、`WithFieldPartialOp`、または `WithKeepAutoIDPk` をチェーンします。

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

    指定した名前、次元、および値を持つ float ベクトル列を追加します。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定した float32 ベクトルを Float16 値に変換し、結果のベクトル列を追加します。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定した float32 ベクトルを BFloat16 値に変換し、結果のベクトル列を追加します。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    指定した名前、次元、および値を持つバイナリベクトル列を追加します。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    指定した名前、次元、および値を持つ Int8 ベクトル列を追加します。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    行ベースのサブフィールド値から構築された struct-array 列を追加します。各行はサブフィールド名をキーとするマップであり、各値は structSchema で宣言されたスカラー型またはベクトル型と一致している必要があります。

- `WithPartition(partitionName string)`

    書き込みリクエストの対象パーティションを設定します。

- `WithNamespace(namespace string)`

    WithNamespace は、書き込みのスコープをコレクションの名前空間に限定します。主キーは delete/upsert tombstone では引き続きコレクションスコープであるため、呼び出し元は同じコレクション内の名前空間間で主キーを一意に保つ必要があります。

- `WithPartialUpdate(partialUpdate bool)`

    書き込みリクエストの部分更新動作を有効または無効にします。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend は、Upsert 中に Array フィールド `fieldName` を ARRAY_APPEND セマンティクスでマージすることを宣言します。非 REPLACE 操作が存在する場合、サーバーは暗黙的に partial_update を有効にするため、呼び出し元が WithPartialUpdate(true) を別途呼び出す必要はありません。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove は、Upsert 中に Array フィールド `fieldName` を ARRAY_REMOVE セマンティクスでマージすることを宣言します。暗黙的な partial_update の昇格については、WithArrayAppend を参照してください。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp は、名前 `fieldName` のフィールドに明示的な FieldPartialUpdateOp を関連付けます。上級の呼び出し元向けであり、一般的な呼び出し元は操作固有のヘルパー（WithArrayAppend、WithArrayRemove）を使用することを推奨します。

- `WithKeepAutoIDPk(keepPk bool)`

    自動 ID 生成が有効な場合に、行ベースの書き込みで指定された主キー値を保持するかどうかを制御します。

**戻り値の型:**

*UpsertResult, error*

**戻り値:**

影響を受けた行数と主キーを返します。また、リクエストの構築または RPC が失敗した場合は error を返します。

```go
type UpsertResult struct {
    UpsertCount int64
    IDs column.Column
}
```

**パラメーター:**

- **UpsertCount** (*int64*) -

    影響を受けたエンティティの数です。

- **IDs** (*column.Column*) -

    影響を受けたエンティティの ID です。

**エラーハンドリング:**

- **error**

    操作は失敗します。検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返された error を確認してください。

## 例\{#example}

Upsert() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("books").
	WithInt64Column("id", []int64{1}).
	WithVarcharColumn("tags", []string{"featured"}).
	WithArrayAppend("tags"))
if err != nil {
	// handle error
}
_ = result
```
