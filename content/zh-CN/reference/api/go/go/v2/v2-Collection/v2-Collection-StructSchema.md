---
title: "StructSchema | Go | v2"
slug: /go/go/v2-Collection-StructSchema
sidebar_label: "StructSchema"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "定义 struct-array 字段的子字段，并验证应用于这些子字段的规则。 | Go | v2"
type: docx
token: CB8KdOcuqopYf6x9PqYcJhXbntc
sidebar_position: 24
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - StructSchema
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# StructSchema

定义 struct-array 字段的子字段，并验证应用于这些子字段的规则。

```go
type StructSchema struct {
    Fields []*Field
}
```

## 请求语法\{#request-syntax}

创建一个空的 struct schema。

```go
entity.NewStructSchema()
```

**方法：**

- `WithField(field *Field) *StructSchema`

    追加一个子字段定义。

- `Validate(parentName string) error`

    拒绝空、重复、嵌套、稀疏向量、可空、键、自动 ID、动态以及具有默认值的子字段。

**返回类型：**

*StructSchema*

**返回：**

表示 struct 字段的 schema，包括嵌套字段定义。

- **Fields** (*[]*Field*) -

    包含 struct-array 子字段定义。

## 示例\{#example}

演示 StructSchema 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256)).
	WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(8))

err := structSchema.Validate("chunks")
fmt.Println(err)
```
