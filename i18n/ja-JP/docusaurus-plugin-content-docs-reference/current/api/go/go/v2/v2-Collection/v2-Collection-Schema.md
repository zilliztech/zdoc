---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Milvus v3 collection schema を定義し、struct-array フィールドを検証し、外部 collection ソース設定をサポートします。 | Go | v2"
type: docx
token: Du2ZdjCWIorDg4xdwercNnYgnJb
sidebar_position: 23
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - Schema
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Schema

Milvus v3 collection schema を定義し、struct-array フィールドを検証し、外部 collection ソース設定をサポートします。

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

## Request Syntax\{#request-syntax}

空の collection schema を作成します。

```go
entity.NewSchema()
```

**METHODS:**

- `WithName(name string) *Schema`

    collection 名を設定します。

- `WithDescription(desc string) *Schema`

    collection の説明を設定します。

- `WithAutoID(autoID bool) *Schema`

    Milvus が主キーを自動生成するかどうかを設定します。

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    dynamic field を有効または無効にします。

- `WithExternalSource(externalSource string) *Schema`

    外部データソース URI を設定します。

- `WithExternalSpec(externalSpec string) *Schema`

    外部ソース設定を JSON として設定します。

- `WithField(field *Field) *Schema`

    field 定義を schema に追加します。

- `WithFunction(function *Function) *Schema`

    組み込み関数の定義を schema に追加します。

- `Validate() error`

    struct-array のサブフィールドを検証し、サポートされていないネストやトップレベル専用フラグに対してエラーを返します。

- `PKFieldName() string`

    主キーフィールド名を返します。

- `PKField() *Field`

    主キーフィールド定義を返します。

- `WithExternalSource(externalSource string)`

    ソースデータ URI を設定します。これはアクセス可能な外部 volume の名前である必要があります。

- `WithExternalSpec(externalSpec string)`

    外部ソース仕様を設定します。これは一連の二次パラメータです。

    - **format** (*string*) - 

        対象ソースデータファイルの形式です。

        取り得る値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

**RETURN TYPE:**

*Schema*

**RETURNS:**

field 定義、関数、dynamic field 設定を含む、collection の schema を表します。

- **CollectionName** (*string*) -

    collection 名を格納します。

- **Description** (*string*) -

    collection の説明を格納します。

- **AutoID** (*bool*) -

    Milvus が主キーを自動生成するかどうかを示します。

- **Fields** (*[]*Field*) -

    collection の field 定義を含みます。

- **EnableDynamicField** (*bool*) -

    dynamic field が有効かどうかを示します。

- **Functions** (*[]*Function*) -

    組み込み関数の定義を含みます。

- **ExternalSource** (*string*) -

    外部データソース（例: `"s3://bucket/path"`）。

- **ExternalSpec** (*string*) -

    外部ソース設定（JSON）。

## Example\{#example}

Schema の使用方法を示します。

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

## Notes\{#notes}

- Struct-array のデコードでは nullable 状態が保持され、親がそれを持たない場合はサブフィールドから `max_capacity` が復元されます。

- `ExternalSource` と `ExternalSpec` は、外部 collection ストレージとその設定を記述します。

