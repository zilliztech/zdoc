---
title: "FieldType | Go | v2"
slug: /go/go/v2-Collection-FieldType
sidebar_label: "FieldType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldType 实例枚举受支持的 Milvus 字段数据类型，并提供用于识别向量类型的辅助方法。 | Go | v2"
type: docx
token: V6aWdRUh3o1alDxmCo5c29hRnic
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - 图像搜索
  - LLMs
  - zilliz
  - zilliz cloud
  - 云
  - FieldType
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# FieldType

FieldType 实例枚举受支持的 Milvus 字段数据类型，并提供用于识别向量类型的辅助方法。

<Admonition type="info" title="Notes">

`IsVectorType()` 对二进制、float、float16、bfloat16、sparse 和 int8 向量字段类型返回 true。

</Admonition>

<Admonition type="info" title="Notes">

`FieldTypeText` 是一种可变长度字符串类型，不需要 `max_length`。

</Admonition>

```go
type FieldType int32
```

**值：**

- **FieldTypeNone** = `0`

    零值占位符。

- **FieldTypeBool** = `1`

- **FieldTypeInt8** = `2`

- **FieldTypeInt16** = `3`

- **FieldTypeInt32** = `4`

- **FieldTypeInt64** = `5`

- **FieldTypeFloat** = `10`

- **FieldTypeDouble** = `11`

- **FieldTypeString** = `20`

- **FieldTypeVarChar** = `21`

    具有指定最大长度的可变长度字符串。

- **FieldTypeArray** = `22`

- **FieldTypeJSON** = `23`

- **FieldTypeGeometry** = `24`

- **FieldTypeText** = `25`

    不需要 max_length 的可变长度字符串。

- **FieldTypeTimestamptz** = `26`

- **FieldTypeBinaryVector** = `100`

- **FieldTypeFloatVector** = `101`

- **FieldTypeFloat16Vector** = `102`

- **FieldTypeBFloat16Vector** = `103`

- **FieldTypeSparseVector** = `104`

- **FieldTypeInt8Vector** = `105`

- **FieldTypeStruct** = `201`

## 示例\{#example}

演示 FieldType 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

fieldType := entity.FieldTypeFloatVector
fmt.Println(fieldType.Name())
fmt.Println(fieldType.IsVectorType())
```
