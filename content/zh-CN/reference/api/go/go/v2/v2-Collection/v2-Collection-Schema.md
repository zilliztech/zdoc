---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "定义 Milvus v3 Collection 的 Schema，验证结构体数组字段，并支持外部 Collection 源配置。 | Go | v2"
type: docx
token: Du2ZdjCWIorDg4xdwercNnYgnJb
sidebar_position: 23
keywords: 
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - NLP 搜索
  - zilliz
  - zilliz cloud
  - 云
  - Schema
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Schema

定义 Milvus v3 Collection 的 Schema，验证结构体数组字段，并支持外部 Collection 源配置。

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

## 请求语法\{#request-syntax}

创建一个空的 Collection Schema。

```go
entity.NewSchema()
```

**方法：**

- `WithName(name string) *Schema`

    设置 Collection 名称。

- `WithDescription(desc string) *Schema`

    设置 Collection 描述。

- `WithAutoID(autoID bool) *Schema`

    设置是否由 Milvus 自动生成主键。

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    启用或禁用动态字段。

- `WithExternalSource(externalSource string) *Schema`

    设置外部数据源 URI。

- `WithExternalSpec(externalSpec string) *Schema`

    将外部源配置设置为 JSON。

- `WithField(field *Field) *Schema`

    向 Schema 追加字段定义。

- `WithFunction(function *Function) *Schema`

    向 Schema 追加内置函数定义。

- `Validate() error`

    验证结构体数组子字段，并在出现不受支持的嵌套或仅限顶层的标志时返回错误。

- `PKFieldName() string`

    返回主键字段名称。

- `PKField() *Field`

    返回主键字段定义。

- `WithExternalSource(externalSource string)`

    设置源数据 URI，该值应为可访问的外部卷名称。

- `WithExternalSpec(externalSpec string)`

    外部源规格，即一组次级参数：

    - **format** (*string*) - 

        目标源数据文件的格式。

        可能的值包括 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

**返回类型：**

*Schema*

**返回值：**

表示 Collection 的 Schema，包括字段定义、函数和动态字段设置。

- **CollectionName** (*string*) -

    存储 Collection 名称。

- **Description** (*string*) -

    存储 Collection 描述。

- **AutoID** (*bool*) -

    指示是否由 Milvus 自动生成主键。

- **Fields** (*[]*Field*) -

    包含 Collection 字段定义。

- **EnableDynamicField** (*bool*) -

    指示是否启用动态字段。

- **Functions** (*[]*Function*) -

    包含内置函数定义。

- **ExternalSource** (*string*) -

    外部数据源（例如："s3://bucket/path"）。

- **ExternalSpec** (*string*) -

    外部源配置（JSON）。

## 示例\{#example}

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

## 说明\{#notes}

- 结构体数组解码会保留 nullable 状态，并在父级未携带该状态时，从子字段恢复 `max_capacity`。

- `ExternalSource` 和 `ExternalSpec` 用于描述外部 Collection 存储和配置。

