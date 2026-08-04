---
title: "Upsert() | Go | v2"
slug: /go/go/v2-Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "struct-array およびフィールドレベル配列操作を使用して行または列をアップサートし、この操作のクライアントテレメトリを記録します。 | Go | v2"
type: docx
token: PB5kdtzs8ok748xwRWacJbEUnze
sidebar_position: 19
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
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

struct-array およびフィールドレベル配列操作を使用して行または列をアップサートし、この操作のクライアントテレメトリを記録します。

```go
func (c *Client) Upsert(ctx context.Context, option UpsertOption, callOptions ...grpc.CallOption) (UpsertResult, error)
```

**パラメーター:**

- **collName** (*string*) -

    **[必須]**

    対象 collection の名前です。

- **rows** (*...any*) -

    **[必須]**

    挿入または更新する 1 つ以上の行の値です。

**ビルダーメソッド:**

- `WithColumns(columns ...column.Column)`

    指定した列を write リクエストに追加します。

- `WithBoolColumn(colName string, data []bool)`

    指定した名前と値を持つ Boolean scalar 列を追加します。

- `WithInt8Column(colName string, data []int8)`

    指定した名前と値を持つ Int8 scalar 列を追加します。

- `WithInt16Column(colName string, data []int16)`

    指定した名前と値を持つ Int16 scalar 列を追加します。

- `WithInt32Column(colName string, data []int32)`

    指定した名前と値を持つ Int32 scalar 列を追加します。

- `WithInt64Column(colName string, data []int64)`

    指定した名前と値を持つ Int64 scalar 列を追加します。

- `WithVarcharColumn(colName string, data []string)`

    指定した名前と値を持つ VarChar scalar 列を追加します。

- `WithFloatVectorColumn(colName string, dim int, data [][]float32)`

    指定した名前、次元、および値を持つ float-vector 列を追加します。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定された float32 vector を Float16 値に変換し、生成された vector 列を追加します。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定された float32 vector を BFloat16 値に変換し、生成された vector 列を追加します。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    指定した名前、次元、および値を持つ binary-vector 列を追加します。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    指定した名前、次元、および値を持つ Int8-vector 列を追加します。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    行ベースのサブフィールド値から構築された struct-array 列を追加します。各行はサブフィールド名をキーとする map であり、各値は `structSchema` で宣言された scalar または vector 型と一致している必要があります。

- `WithPartition(partitionName string)`

    write リクエストの対象 partition を設定します。

- `WithNamespace(namespace string)`

    WithNamespace は write の対象を collection namespace に限定します。主キーは delete/upsert tombstone では引き続き collection スコープであるため、呼び出し元は同じ collection 内の namespace 間で主キーが一意になるように維持する必要があります。

- `WithPartialUpdate(partialUpdate bool)`

    write リクエストの partial-update 動作を有効または無効にします。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend は、Array フィールド `fieldName` が Upsert 中に ARRAY_APPEND セマンティクスでマージされるべきことを宣言します。非 REPLACE 操作が存在する場合、サーバーは暗黙的に partial_update を有効にするため、呼び出し元が `WithPartialUpdate(true)` を別途呼び出す必要はありません。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove は、Array フィールド `fieldName` が Upsert 中に ARRAY_REMOVE セマンティクスでマージされるべきことを宣言します。partial_update の暗黙的な昇格については WithArrayAppend を参照してください。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp は、名前 `fieldName` のフィールドに明示的な FieldPartialUpdateOp を関連付けます。上級ユーザー向けであり、一般的なユーザーは操作固有のヘルパー（WithArrayAppend、WithArrayRemove）を使用することを推奨します。

- `WithKeepAutoIDPk(keepPk bool)`

    自動 ID 生成が有効な場合に、行ベースの write で指定された主キー値を保持するかどうかを制御します。

**戻り値の型:**

*UpsertResult, error*

**戻り値:**

影響を受けた行数と主キーを返します。加えて、リクエスト構築または RPC が失敗した場合は error を返します。

**エラーハンドリング:**

- **error**

    検証、リクエスト構築、または RPC が失敗しました。失敗の詳細は返された error を確認してください。

## Example\{#example}

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
