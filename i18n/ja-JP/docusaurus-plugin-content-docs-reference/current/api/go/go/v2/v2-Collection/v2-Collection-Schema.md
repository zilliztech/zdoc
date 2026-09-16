---
title: "スキーマ | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "スキーマ"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Milvus v3 のコレクションスキーマを定義し、struct-array フィールドを検証し、外部コレクションソース設定をサポートします。 | Go | v2"
type: docx
token: Du2ZdjCWIorDg4xdwercNnYgnJb
sidebar_position: 23
keywords: 
  - 高密度埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - nlp 検索
  - zilliz
  - zilliz cloud
  - cloud
  - スキーマ
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# スキーマ

Milvus v3 のコレクションスキーマを定義し、struct-array フィールドを検証し、外部コレクションソース設定をサポートします。

```go
type Schema struct {
    CollectionName string
    Description string
    AutoID bool
    Fields []*Field
    EnableDynamicField bool
    Functions []*Function
    ExternalSource string
    ExternalSpec string
}
```

## リクエスト構文\{#request-syntax}

空のコレクションスキーマを作成します。

```go
entity.NewSchema()
```

**メソッド:**

- `WithName(name string) *Schema`

    コレクション名を設定します。

- `WithDescription(desc string) *Schema`

    コレクションの説明を設定します。

- `WithAutoID(autoID bool) *Schema`

    Milvus が主キーを自動生成するかどうかを設定します。

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    動的フィールドを有効または無効にします。

- `WithExternalSource(externalSource string) *Schema`

    外部データソース URI を設定します。

- `WithExternalSpec(externalSpec string) *Schema`

    外部ソース構成を JSON として設定します。

- `WithField(field *Field) *Schema`

    スキーマにフィールド定義を追加します。

- `WithFunction(function *Function) *Schema`

    スキーマに組み込み関数定義を追加します。

- `Validate() error`

    struct-array のサブフィールドを検証し、サポートされていないネストまたはトップレベル専用フラグに対してエラーを返します。

- `PKFieldName() string`

    主キーフィールド名を返します。

- `PKField() *Field`

    主キーフィールド定義を返します。

- `WithExternalSource(externalSource string)`

    ソースデータ URI を設定します。これはアクセス可能な外部ボリュームの名前である必要があります。

- `WithExternalSpec(externalSpec string)`

    外部ソース仕様です。これは一連の二次パラメータです。

    - **format** (*string*) - 

        対象ソースデータファイルの形式です。

        使用可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

**戻り値の型:**

*スキーマ*

**戻り値:**

フィールド定義、関数、動的フィールド設定を含む、コレクションのスキーマを表します。

- **CollectionName** (*string*) -

    コレクション名を格納します。

- **Description** (*string*) -

    コレクションの説明を格納します。

- **AutoID** (*bool*) -

    Milvus が主キーを自動生成するかどうかを示します。

- **Fields** (<em>[]</em>Field&ast;) -

    コレクションのフィールド定義を含みます。

- **EnableDynamicField** (*bool*) -

    動的フィールドが有効かどうかを示します。

- **Functions** (<em>[]</em>Function&ast;) -

    組み込み関数定義を含みます。

- **ExternalSource** (*string*) -

    外部データソース（例: "s3://bucket/path"）。

- **ExternalSpec** (*string*) -

    外部ソース構成（JSON）。

## 例\{#example}

スキーマの使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(8))

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("chunks").WithDataType(entity.FieldTypeArray).WithElementType(entity.FieldTypeStruct).WithStructSchema(structSchema))

err := schema.Validate()
fmt.Println(err)
```

## 備考\{#notes}

- struct-array のデコードでは nullable 状態が保持され、親がそれを持たない場合はサブフィールドから `max_capacity` が復元されます。

- `ExternalSource` と `ExternalSpec` は、外部コレクションストレージとその構成を説明します。

