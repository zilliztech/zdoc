---
title: "StructSchema | Go | v2"
slug: /go/go/v2-Collection-StructSchema
sidebar_label: "StructSchema"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "定义结构体数组字段的子字段，并验证应用于这些子字段的规则。 | Go | v2"
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

定义结构体数组字段的子字段，并验证应用于这些子字段的规则。

```go
type StructSchema struct {
    Fields []*Field
}
```

## 请求语法\{#request-syntax}

创建一个空的结构体 schema。

```go
entity.NewStructSchema()
```

**方法：**

- `WithField(field *Field) *StructSchema`

    追加一个子字段定义。

- `Validate(parentName string) error`

    拒绝空的、重复的、嵌套的、稀疏向量的、可空的、主键的、自动 ID 的、动态的以及带默认值的子字段。

**返回类型：**

*StructSchema*

**返回：**

表示结构体字段的 schema，包括嵌套字段定义。

- **Fields** (*[]*Field*) -

    包含结构体数组的子字段定义。

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
