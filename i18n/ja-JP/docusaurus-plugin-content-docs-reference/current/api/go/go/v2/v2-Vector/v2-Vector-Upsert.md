---
title: "Upsert() | Go | v2"
slug: /go/go/v2-Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "struct-array およびフィールドレベル配列操作で行または列をアップサートし、この操作のクライアントテレメトリを記録します。 | Go | v2"
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

struct-array およびフィールドレベル配列操作で行または列をアップサートし、この操作のクライアントテレメトリを記録します。

```go
func (c *Client) Upsert(ctx context.Context, option UpsertOption, callOptions ...grpc.CallOption) (UpsertResult, error)
```

**PARAMETERS:**

- **collName** (*string*) -

    **[REQUIRED]**

    対象 collection の名前。

- **rows** (*...any*) -

    **[REQUIRED]**

    挿入または更新する 1 つ以上の行の値。

**BUILDER METHODS:**

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

    指定された名前、次元、値を持つ float-vector 列を追加します。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定された float32 vector を Float16 値に変換し、結果の vector 列を追加します。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    指定された float32 vector を BFloat16 値に変換し、結果の vector 列を追加します。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    指定された名前、次元、値を持つ binary-vector 列を追加します。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    指定された名前、次元、値を持つ Int8-vector 列を追加します。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    行ベースのサブフィールド値から構築された struct-array 列を追加します。各行はサブフィールド名をキーとする map であり、各値は structSchema で宣言された scalar または vector 型に一致している必要があります。

- `WithPartition(partitionName string)`

    write リクエストの対象 partition を設定します。

- `WithNamespace(namespace string)`

    WithNamespace は write を collection namespace にスコープします。delete/upsert tombstone の primary key は引き続き collection スコープであるため、呼び出し元は同じ collection 内の namespace 間で primary key の一意性を保つ必要があります。

- `WithPartialUpdate(partialUpdate bool)`

    write リクエストの partial-update 動作を有効または無効にします。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend は、Array フィールド `fieldName` を Upsert 中に ARRAY_APPEND セマンティクスでマージすることを宣言します。非 `REPLACE` オペレーションが存在する場合、サーバーは暗黙的に partial_update を有効化するため、呼び出し元は `WithPartialUpdate(true)` を追加で呼び出す必要はありません。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove は、Array フィールド `fieldName` を Upsert 中に ARRAY_REMOVE セマンティクスでマージすることを宣言します。partial_update の暗黙的な昇格については WithArrayAppend を参照してください。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp は、名前 `fieldName` を持つフィールドに明示的な FieldPartialUpdateOp を付与します。上級ユーザー向けであり、通常のユーザーは op 固有のヘルパー（WithArrayAppend、WithArrayRemove）を使うことを推奨します。

- `WithKeepAutoIDPk(keepPk bool)`

    自動 ID 生成が有効な場合に、行ベースの write で指定された primary-key 値を保持するかどうかを制御します。

**RETURN TYPE:**

*UpsertResult, error*

**RETURNS:**

影響を受けた行数と primary key を返します。あわせて、リクエスト構築または RPC が失敗した場合は error も返します。

**ERROR HANDLING:**

- **error**

    バリデーション、リクエスト構築、または RPC が失敗します。失敗の詳細は返された error を確認してください。

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
