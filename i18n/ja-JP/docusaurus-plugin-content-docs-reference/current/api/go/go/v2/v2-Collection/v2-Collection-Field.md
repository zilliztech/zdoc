---
title: "Field | Go | v2"
slug: /go/go/v2-Collection-Field
sidebar_label: "Field"
beta: false
added_since: v2.6.x
last_modified: v3.0.0
deprecate_since: false
notebook: false
description: "collection スキーマ内の field を定義します。データ型、制約、インデックスプロパティを含みます。 | Go | v2"
type: docx
token: DPcJdZceFoes0sxeRVKcKhaunq9
sidebar_position: 15
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - Field
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Field

collection スキーマ内の field を定義します。データ型、制約、インデックスプロパティを含みます。

```go
type Field struct {
    ID int64
    Name string
    PrimaryKey bool
    AutoID bool
    Description string
    DataType FieldType
    TypeParams map[string]string
    IndexParams map[string]string
    IsDynamic bool
    IsPartitionKey bool
    IsClusteringKey bool
    ElementType FieldType
    DefaultValue *schemapb.ValueField
    Nullable bool
    StructSchema *StructSchema
}
```

## Constructor\{#constructor}

```go
entity.NewField().
    WithName(name).
    WithDescription(desc).
    WithDataType(dataType).
    WithIsPrimaryKey(isPrimaryKey).
    // ...
```

**BUILDER METHODS:**

- `WithName(name string)`

    field の名前を設定します。

- `WithDescription(desc string)`

    field の説明を設定します。

- `WithDataType(dataType [FieldType](./v2-Collection-FieldType))`

    field のデータ型を設定します（例: Int64、VarChar、FloatVector）。

- `WithIsPrimaryKey(isPrimaryKey bool)`

    この field が主キーかどうかを設定します。

- `WithIsAutoID(isAutoID bool)`

    この field の自動 ID 生成を有効にします。

- `WithIsDynamic(isDynamic bool)`

    これを動的 field としてマークします。

- `WithIsPartitionKey(isPartitionKey bool)`

    データルーティング用の partition key としてこの field を設定します。

- `WithIsClusteringKey(isClusteringKey bool)`

    データ構成用の clustering key としてこの field を設定します。

- `WithNullable(nullable bool)`

    この field が null 値を許可するかどうかを設定します。

- `WithDefaultValueBool(defaultValue bool)`

    field のデフォルト値を設定します。

- `WithDefaultValueInt(defaultValue int32)`

    field のデフォルト値を設定します。

- `WithDefaultValueLong(defaultValue int64)`

    field のデフォルト値を設定します。

- `WithDefaultValueFloat(defaultValue float32)`

    field のデフォルト値を設定します。

- `WithDefaultValueDouble(defaultValue float64)`

    field のデフォルト値を設定します。

- `WithDefaultValueTimestamptz(defaultValue int64)`

    field のデフォルト値を設定します。

- `WithDefaultValueString(defaultValue string)`

    field のデフォルト値を設定します。

- `WithTypeParams(key string, value string)`

    field の型パラメータのキーと値のペアを設定します。

- `WithDim(dim int64)`

    この field の vector 次元を設定します。

- `WithMaxLength(maxLen int64)`

    varchar field の最大文字長を設定します。

- `WithElementType(eleType [FieldType](./v2-Collection-FieldType))`

    array field の要素型を設定します。

- `WithMaxCapacity(maxCap int64)`

    array field の最大容量を設定します。

- `WithEnableAnalyzer(enable bool)`

    この field の全文検索用テキストアナライザーを有効にします。

- `WithAnalyzerParams(params map[string]any)`

    テキスト処理用のアナライザーパラメータを設定します。

- `WithMultiAnalyzerParams(params map[string]any)`

    field の複数のアナライザー設定を指定します。

- `WithEnableMatch(enable bool)`

    この field のテキストマッチングを有効にします。

- `WithStructSchema(schema *StructSchema)`

    struct 型 field の struct スキーマを設定します。

- `WithExternalField(externalField string)`

    現在の field がマッピングする外部データファイル内の field 名を設定します。

**METHODS:**

- `GetDim() int64, error`

    dim を取得します。

## Example\{#example}

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
)

// Primary key field
pkField := entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true)

// Vector field
vectorField := entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768)

// Scalar field with max length
varcharField := entity.NewField().
    WithName("category").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(256)
```
