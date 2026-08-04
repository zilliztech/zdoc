---
title: "Field | Go | v2"
slug: /go/go/v2-Collection-Field
sidebar_label: "Field"
beta: false
added_since: v2.6.x
last_modified: v3.0.0
deprecate_since: false
notebook: false
description: "コレクションスキーマ内のフィールドを定義します。データ型、制約、インデックスのプロパティを含みます。 | Go | v2"
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

コレクションスキーマ内のフィールドを定義します。データ型、制約、インデックスのプロパティを含みます。

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

## コンストラクタ\{#constructor}

```go
entity.NewField().
    WithName(name).
    WithDescription(desc).
    WithDataType(dataType).
    WithIsPrimaryKey(isPrimaryKey).
    // ...
```

**ビルダーメソッド:**

- `WithName(name string)`

    フィールドの名前を設定します。

- `WithDescription(desc string)`

    フィールドの説明を設定します。

- `WithDataType(dataType FieldType)`

    フィールドのデータ型を設定します（例: Int64、VarChar、FloatVector）。

- `WithIsPrimaryKey(isPrimaryKey bool)`

    このフィールドが主キーかどうかを設定します。

- `WithIsAutoID(isAutoID bool)`

    このフィールドの自動 ID 生成を有効にします。

- `WithIsDynamic(isDynamic bool)`

    これを動的フィールドとしてマークします。

- `WithIsPartitionKey(isPartitionKey bool)`

    データルーティング用のパーティションキーとしてこのフィールドを設定します。

- `WithIsClusteringKey(isClusteringKey bool)`

    データ整理用のクラスタリングキーとしてこのフィールドを設定します。

- `WithNullable(nullable bool)`

    このフィールドが null 値を許可するかどうかを設定します。

- `WithDefaultValueBool(defaultValue bool)`

    フィールドのデフォルト値を設定します。

- `WithDefaultValueInt(defaultValue int32)`

    フィールドのデフォルト値を設定します。

- `WithDefaultValueLong(defaultValue int64)`

    フィールドのデフォルト値を設定します。

- `WithDefaultValueFloat(defaultValue float32)`

    フィールドのデフォルト値を設定します。

- `WithDefaultValueDouble(defaultValue float64)`

    フィールドのデフォルト値を設定します。

- `WithDefaultValueTimestamptz(defaultValue int64)`

    フィールドのデフォルト値を設定します。

- `WithDefaultValueString(defaultValue string)`

    フィールドのデフォルト値を設定します。

- `WithTypeParams(key string, value string)`

    フィールドの型パラメータのキーと値のペアを設定します。

- `WithDim(dim int64)`

    このフィールドのベクトル次元を設定します。

- `WithMaxLength(maxLen int64)`

    VarChar フィールドの最大文字長を設定します。

- `WithElementType(eleType FieldType)`

    配列フィールドの要素型を設定します。

- `WithMaxCapacity(maxCap int64)`

    配列フィールドの最大容量を設定します。

- `WithEnableAnalyzer(enable bool)`

    このフィールドで全文検索を行うためのテキストアナライザーを有効にします。

- `WithAnalyzerParams(params map[string]any)`

    テキスト処理用のアナライザーパラメータを設定します。

- `WithMultiAnalyzerParams(params map[string]any)`

    フィールドの複数のアナライザー設定を設定します。

- `WithEnableMatch(enable bool)`

    このフィールドのテキストマッチングを有効にします。

- `WithStructSchema(schema *StructSchema)`

    struct 型フィールドの struct スキーマを設定します。

- `WithExternalField(externalField string)`

    現在のフィールドがマッピングされる、外部データファイル内のフィールド名を設定します。

**メソッド:**

- `GetDim() int64, error`

    dim を取得します。

## 例\{#example}

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
