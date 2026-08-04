---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "定义 Milvus v3 集合 schema，验证 struct-array 字段，并支持外部集合源配置。 | Go | v2"
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

定义 Milvus v3 集合 schema，验证 struct-array 字段，并支持外部集合源配置。

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

创建一个空的集合 schema。

```go
entity.NewSchema()
```

**METHODS:**

- `WithName(name string) *Schema`

    设置集合名称。

- `WithDescription(desc string) *Schema`

    设置集合描述。

- `WithAutoID(autoID bool) *Schema`

    设置是否由 Milvus 自动生成主键。

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    启用或禁用动态字段。

- `WithExternalSource(externalSource string) *Schema`

    设置外部数据源 URI。

- `WithExternalSpec(externalSpec string) *Schema`

    以 JSON 格式设置外部源配置。

- `WithField(field *Field) *Schema`

    向 schema 追加一个字段定义。

- `WithFunction(function *Function) *Schema`

    向 schema 追加一个内置函数定义。

- `Validate() error`

    验证 struct-array 子字段；如果存在不支持的嵌套或仅允许顶层使用的标记，则返回错误。

- `PKFieldName() string`

    返回主键字段名称。

- `PKField() *Field`

    返回主键字段定义。

- `WithExternalSource(externalSource string)`

    设置源数据 URI，该 URI 应为可访问的外部卷名称。

- `WithExternalSpec(externalSpec string)`

    外部源规格，是一组次级参数：

    - **format** (*string*) - 

        目标源数据文件的格式。

        可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

**RETURN TYPE:**

*Schema*

**RETURNS:**

表示一个集合的 schema，包括字段定义、函数和动态字段设置。

- **CollectionName** (*string*) -

    存储集合名称。

- **Description** (*string*) -

    存储集合描述。

- **AutoID** (*bool*) -

    表示是否由 Milvus 自动生成主键。

- **Fields** (*[]*Field*) -

    包含集合字段定义。

- **EnableDynamicField** (*bool*) -

    表示是否启用了动态字段。

- **Functions** (*[]*Function*) -

    包含内置函数定义。

- **ExternalSource** (*string*) -

    外部数据源（例如 `"s3://bucket/path"`）。

- **ExternalSpec** (*string*) -

    外部源配置（JSON）。

## Example\{#example}

演示 Schema 的用法。

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

- Struct-array 解码会保留 nullable 状态，并在父字段未携带 `max_capacity` 时从子字段恢复该值。

- `ExternalSource` 和 `ExternalSpec` 用于描述外部集合存储及其配置。

