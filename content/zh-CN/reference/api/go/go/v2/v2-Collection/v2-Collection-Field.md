---
title: "Field | Go | v2"
slug: /go/go/v2-Collection-Field
sidebar_label: "Field"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Field 实例定义 Collection Schema 中的字段，包括其数据类型、约束和索引属性。 | Go | v2"
type: docx
token: DPcJdZceFoes0sxeRVKcKhaunq9
sidebar_position: 15
keywords: 
  - 智能体 RAG
  - RAG LLM 架构
  - 私有 LLM
  - 最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - 字段
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Field

Field 实例定义 Collection Schema 中的字段，包括其数据类型、约束和索引属性。

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

**字段：**

- **ID**（*int64*）-

    字段 ID，在创建 Collection 时生成；输入值会被忽略。

- **Name**（*string*）-

    字段的名称。

- **PrimaryKey**（*bool*）-

    该字段是否为主键。

- **AutoID**（*bool*）-

    ID 是否自动生成。

- **Description**（*string*）-

    便于人类阅读的字段描述。

- **DataType**（[FieldType](./v2-Collection-FieldType)）-

    字段的数据类型。

- **TypeParams**（*map[string]string*）-

    字段的类型参数，例如 dim 或 max_length。

- **IndexParams**（*map[string]string*）-

    字段的索引参数。

- **IsDynamic**（*bool*）-

    该字段是否为动态字段。

- **IsPartitionKey**（*bool*）-

    该字段是否为 Partition 键。

- **IsClusteringKey**（*bool*）-

    该字段是否为聚类键。

- **ElementType**（[FieldType](./v2-Collection-FieldType)）-

    数组字段的元素类型。

- **DefaultValue**（&ast;*schemapb.ValueField*）-

    字段的默认值。

- **Nullable**（*bool*）-

    该字段是否接受 null 值。

- **StructSchema**（&ast;*StructSchema*）-

    struct 类型字段的 Schema。

- **ExternalField**（*string*）-

    当前字段映射到的外部数据文件中的字段名称。

**构建器方法：**

- `WithName(name string)`

    设置字段的名称。

- `WithDescription(desc string)`

    设置字段的描述。

- `WithDataType(dataType [FieldType](FieldType.md))`

    设置字段的数据类型（例如 Int64、VarChar、FloatVector）。

- `WithIsPrimaryKey(isPrimaryKey bool)`

    设置此字段是否为主键。

- `WithIsAutoID(isAutoID bool)`

    为此字段启用自动 ID 生成。

- `WithIsDynamic(isDynamic bool)`

    将此字段标记为动态字段。

- `WithIsPartitionKey(isPartitionKey bool)`

    将此字段设置为用于数据路由的 Partition 键。

- `WithIsClusteringKey(isClusteringKey bool)`

    将此字段设置为用于数据组织的聚类键。

- `WithNullable(nullable bool)`

    设置此字段是否允许 null 值。

- `WithDefaultValueBool(defaultValue bool)`

    设置字段的默认值。

- `WithDefaultValueInt(defaultValue int32)`

    设置字段的默认值。

- `WithDefaultValueLong(defaultValue int64)`

    设置字段的默认值。

- `WithDefaultValueFloat(defaultValue float32)`

    设置字段的默认值。

- `WithDefaultValueDouble(defaultValue float64)`

    设置字段的默认值。

- `WithDefaultValueTimestamptz(defaultValue int64)`

    设置字段的默认值。

- `WithDefaultValueString(defaultValue string)`

    设置字段的默认值。

- `WithTypeParams(key string, value string)`

    设置字段的类型参数键值对。

- `WithDim(dim int64)`

    设置此字段的向量维度。

- `WithMaxLength(maxLen int64)`

    设置 varchar 字段的最大字符长度。

- `WithElementType(eleType [FieldType](FieldType.md))`

    设置数组字段的元素类型。

- `WithMaxCapacity(maxCap int64)`

    设置数组字段的最大容量。

- `WithEnableAnalyzer(enable bool)`

    为此字段启用文本 Analyzer，以支持全文搜索。

- `WithAnalyzerParams(params map[string]any)`

    设置用于文本处理的 Analyzer 参数。

- `WithMultiAnalyzerParams(params map[string]any)`

    为字段设置多个 Analyzer 配置。

- `WithEnableMatch(enable bool)`

    启用此字段的文本匹配。

- `WithStructSchema(schema *StructSchema)`

    为 struct 类型字段设置 struct Schema。

- `WithExternalField(externalField string)`

    设置当前字段映射到的外部数据文件中的字段名称。

**方法：**

- `GetDim() (int64, error)`

    返回字段的维度。

## 示例\{#example}

演示 Field 的用法。

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
