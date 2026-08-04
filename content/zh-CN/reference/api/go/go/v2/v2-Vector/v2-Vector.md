---
title: "Vector | Go | v2"
slug: /go/go/v2-Vector
sidebar_label: "Vector"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "向量数据的接口。实现包括 FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector 和 Text。 | Go | v2"
type: docx
token: CE0odAFVdoh2ehxNFRecD8WEn3f
sidebar_position: 21
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - Vector
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Vector

向量数据的接口。实现包括 FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector 和 Text。

```go
type Vector interface {
    Dim() int
    Serialize() []byte
    FieldType() FieldType
}
```

**方法：**

- `Dim() int`

    返回向量的维度。

- `Serialize() []byte`

    将向量数据序列化为字节。

- `FieldType() FieldType`

    返回此向量类型对应的 FieldType 枚举值。

## 向量数组类型\{#vector-array-types}

- `FloatVectorArray`

    将多个 FloatVector 值分组到一个查询向量槽中，用于对结构体数组中 ArrayOfVector 子字段执行 MAX_SIM 风格搜索。

- `Float16VectorArray`

    将多个 Float16Vector 值分组，用于 EmbListFloat16Vector 搜索。

- `BFloat16VectorArray`

    将多个 BFloat16Vector 值分组，用于 EmbListBFloat16Vector 搜索。

- `BinaryVectorArray`

    将多个 BinaryVector 值分组，用于 EmbListBinaryVector 搜索。

- `Int8VectorArray`

    将多个 Int8Vector 值分组，用于 EmbListInt8Vector 搜索。

## 示例\{#example}

```go
// Vector is typically obtained from API calls or constructors
// TODO: Usage example
```
