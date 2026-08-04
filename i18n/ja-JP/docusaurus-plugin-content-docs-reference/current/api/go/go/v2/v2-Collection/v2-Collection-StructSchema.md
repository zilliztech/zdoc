---
title: "StructSchema | Go | v2"
slug: /go/go/v2-Collection-StructSchema
sidebar_label: "StructSchema"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "struct-array フィールドのサブフィールドを定義し、それらのサブフィールドに適用されるルールを検証します。 | Go | v2"
type: docx
token: CB8KdOcuqopYf6x9PqYcJhXbntc
sidebar_position: 24
keywords: 
  - ベクトル化
  - k 最近傍アルゴリズム
  - ANNS
  - ベクトル検索
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

struct-array フィールドのサブフィールドを定義し、それらのサブフィールドに適用されるルールを検証します。

```go
type StructSchema struct {
    Fields []*Field
}
```

## リクエスト構文\{#request-syntax}

空の struct schema を作成します。

```go
entity.NewStructSchema()
```

**メソッド:**

- `WithField(field *Field) *StructSchema`

    サブフィールド定義を追加します。

- `Validate(parentName string) error`

    空、重複、ネスト済み、sparse-vector、nullable、key、auto-ID、dynamic、およびデフォルト値を持つサブフィールドを拒否します。

**戻り値の型:**

*StructSchema*

**戻り値:**

ネストされたフィールド定義を含む、struct フィールドの schema を表します。

- **Fields** (*[]*Field*) -

    struct-array のサブフィールド定義が含まれます。

## 例\{#example}

StructSchema の使用方法を示します。

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
