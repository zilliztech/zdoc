---
title: "Field | Go | v2"
slug: /go/go/v2-Collection-Field
sidebar_label: "Field"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Field インスタンスは、データ型、制約、インデックスプロパティを含むコレクションスキーマ内のフィールドを定義します。 | Go | v2"
type: docx
token: DPcJdZceFoes0sxeRVKcKhaunq9
sidebar_position: 15
keywords: 
  - エージェント型 RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - 最近傍検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - Field
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Field

Field インスタンスは、データ型、制約、インデックスプロパティを含むコレクションスキーマ内のフィールドを定義します。

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
    ExternalField string
}
```

**フィールド:**

- **ID** (*int64*) -

    フィールド ID です。コレクションの作成時に生成され、入力値は無視されます。

- **Name** (*string*) -

    フィールドの名前です。

- **PrimaryKey** (*bool*) -

    フィールドが主キーかどうかを示します。

- **AutoID** (*bool*) -

    ID が自動生成されるかどうかを示します。

- **Description** (*string*) -

    フィールドを人間が読める形式で説明したものです。

- **DataType** ([FieldType](./v2-Collection-FieldType)) -

    フィールドのデータ型です。

- **TypeParams** (*map[string]string*) -

    dim や max_length など、フィールドの型パラメーターです。

- **IndexParams** (*map[string]string*) -

    フィールドのインデックスパラメーターです。

- **IsDynamic** (*bool*) -

    フィールドが動的フィールドかどうかを示します。

- **IsPartitionKey** (*bool*) -

    フィールドがパーティションキーかどうかを示します。

- **IsClusteringKey** (*bool*) -

    フィールドがクラスタリングキーかどうかを示します。

- **ElementType** ([FieldType](./v2-Collection-FieldType)) -

    配列フィールドの要素型です。

- **DefaultValue** (&ast;*schemapb.ValueField*) -

    フィールドのデフォルト値です。

- **Nullable** (*bool*) -

    フィールドが null 値を受け入れるかどうかを示します。

- **StructSchema** (&ast;*StructSchema*) -

    構造体型フィールドの構造体スキーマです。

- **ExternalField** (*string*) -

    現在のフィールドのマップ先となる、外部データファイル内のフィールドの名前です。

**ビルダーメソッド:**

- `WithName(name string)`

    フィールドの名前を設定します。

- `WithDescription(desc string)`

    フィールドの説明を設定します。

- `WithDataType(dataType [FieldType](FieldType.md))`

    フィールドのデータ型（例: Int64、VarChar、FloatVector）を設定します。

- `WithIsPrimaryKey(isPrimaryKey bool)`

    このフィールドが主キーかどうかを設定します。

- `WithIsAutoID(isAutoID bool)`

    このフィールドの自動 ID 生成を有効にします。

- `WithIsDynamic(isDynamic bool)`

    このフィールドを動的フィールドとしてマークします。

- `WithIsPartitionKey(isPartitionKey bool)`

    データルーティング用のパーティションキーとしてこのフィールドを設定します。

- `WithIsClusteringKey(isClusteringKey bool)`

    データ編成用のクラスタリングキーとしてこのフィールドを設定します。

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

    フィールドの型パラメーターのキーと値のペアを設定します。

- `WithDim(dim int64)`

    このフィールドのベクトル次元を設定します。

- `WithMaxLength(maxLen int64)`

    varchar フィールドの最大文字長を設定します。

- `WithElementType(eleType [FieldType](FieldType.md))`

    配列フィールドの要素型を設定します。

- `WithMaxCapacity(maxCap int64)`

    配列フィールドの最大容量を設定します。

- `WithEnableAnalyzer(enable bool)`

    このフィールドの全文検索用テキストアナライザーを有効にします。

- `WithAnalyzerParams(params map[string]any)`

    テキスト処理用のアナライザーパラメーターを設定します。

- `WithMultiAnalyzerParams(params map[string]any)`

    フィールドの複数のアナライザー構成を設定します。

- `WithEnableMatch(enable bool)`

    このフィールドのテキストマッチングを有効にします。

- `WithStructSchema(schema *StructSchema)`

    構造体型フィールドの構造体スキーマを設定します。

- `WithExternalField(externalField string)`

    現在のフィールドのマップ先となる、外部データファイル内のフィールドの名前を設定します。

**メソッド:**

- `GetDim() (int64, error)`

    フィールドの次元を返します。

## 例\{#example}

Field の使用例を示します。

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
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
