---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.0
deprecate_since: false
notebook: false
description: "field 定義、functions、および dynamic field 設定を含む、collection の schema を表します。 | Go | v2"
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

field 定義、functions、および dynamic field 設定を含む、collection の schema を表します。

```go
type Schema struct {
    CollectionName string
    Description string
    AutoID bool
    Fields []*Field
    EnableDynamicField bool
    Functions []*Function
}
```

## Constructor\{#constructor}

```go
entity.NewSchema().
    WithName(name).
    WithDescription(desc).
    WithAutoID(autoID).
    WithDynamicFieldEnabled(dynamicEnabled).
    // ...
```

**BUILDER METHODS:**

- `WithName(name string)`

    schema の name 値を設定し、schema 自身を返します。

- `WithExternalSource(externalSource string)`

    ソースデータ URI を設定します。これはアクセス可能な external volume の名前である必要があります。

- `WithExternalSpec(externalSpec string)`

    external source の仕様であり、以下の二次パラメータのセットです。

    - **format** (*string*) - 

        対象ソースデータファイルの形式です。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

- `WithDescription(desc string)`

    schema の description 値を設定し、schema 自身を返します。

- `WithAutoID(autoID bool)`

    collection の auto ID 生成を有効または無効にします。これは external collection には適用されません。

- `WithDynamicFieldEnabled(dynamicEnabled bool)`

    柔軟なデータ挿入のための dynamic field サポートを有効または無効にします。

- `WithField(f *[Field](./v2-Collection-Field))`

    schema に field を追加し、schema 自身を返します。

- `WithFunction(f *[Function](./v2-Collection-Function))`

    schema に function 定義（例: BM25、text embedding）を追加します。これは external collection には適用されません。

**METHODS:**

- `PKFieldName() string`

    この schemapb の pk field 名を返します。

- `PKField() *[Field`](./v2-Collection-Field)

    この schema の PK Field schema を返します。

## Example\{#example}

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
)

schema := entity.NewSchema().
    WithName("my_collection").
    WithField(entity.NewField().
        WithName("id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true)).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(768))
```
