---
title: "Insert() | Go | v2"
slug: /go/go/v2-Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "插入行或列，支持 struct-array 输入，并记录该操作的客户端遥测数据。 | Go | v2"
type: docx
token: NQsbdUsP8oIAbOxSnEEcKUBMnkg
sidebar_position: 11
keywords: 
  - 向量数据库教程
  - 向量数据库如何工作
  - 向量数据库对比
  - openai 向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - Insert()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Insert()

插入行或列，支持 struct-array 输入，并记录该操作的客户端遥测数据。

```go
func (c *Client) Insert(ctx context.Context, option InsertOption, callOptions ...grpc.CallOption) (InsertResult, error)
```

**参数：**

- **collName** (*string*) -

    **[必需]**

    目标集合的名称。

- **rows** (*...any*) -

    **[必需]**

    要插入的一个或多个行值。

**构建器方法：**

- `WithColumns(columns ...column.Column)`

    将提供的列追加到写入请求中。

- `WithBoolColumn(colName string, data []bool)`

    追加一个具有指定名称和值的 Boolean 标量列。

- `WithInt8Column(colName string, data []int8)`

    追加一个具有指定名称和值的 Int8 标量列。

- `WithInt16Column(colName string, data []int16)`

    追加一个具有指定名称和值的 Int16 标量列。

- `WithInt32Column(colName string, data []int32)`

    追加一个具有指定名称和值的 Int32 标量列。

- `WithInt64Column(colName string, data []int64)`

    追加一个具有指定名称和值的 Int64 标量列。

- `WithVarcharColumn(colName string, data []string)`

    追加一个具有指定名称和值的 VarChar 标量列。

- `WithFloatVectorColumn(colName string, dim int, data [][]float32)`

    追加一个具有指定名称、维度和值的 float-vector 列。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    将提供的 float32 向量转换为 Float16 值，并追加生成的向量列。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    将提供的 float32 向量转换为 BFloat16 值，并追加生成的向量列。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    追加一个具有指定名称、维度和值的 binary-vector 列。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    追加一个具有指定名称、维度和值的 Int8-vector 列。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    追加一个根据基于行的子字段值构建的 struct-array 列。每一行都是一个以子字段名称为键的映射，并且每个值都必须与 `structSchema` 中声明的标量或向量类型匹配。

- `WithPartition(partitionName string)`

    为写入请求设置目标分区。

- `WithNamespace(namespace string)`

    WithNamespace 将写入范围限定在集合命名空间内。对于 delete/upsert tombstones，主键仍然是集合级别作用域，因此调用方必须在同一集合的各命名空间之间保持主键唯一。

- `WithPartialUpdate(partialUpdate bool)`

    为写入请求启用或禁用部分更新行为。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend 声明在 Upsert 期间，Array 字段 `fieldName` 应使用 ARRAY_APPEND 语义进行合并。当存在任何非 REPLACE 操作时，服务器会隐式启用 `partial_update`，因此调用方无需再额外调用 `WithPartialUpdate(true)`。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove 声明在 Upsert 期间，Array 字段 `fieldName` 应使用 ARRAY_REMOVE 语义进行合并。有关隐式提升为 `partial_update` 的行为，请参见 WithArrayAppend。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp 为名称为 `fieldName` 的字段附加显式的 FieldPartialUpdateOp。此方法面向高级调用方；普通用户应优先使用特定操作的辅助方法（WithArrayAppend、WithArrayRemove）。

- `WithKeepAutoIDPk(keepPk bool)`

    控制在启用自动 ID 生成时，基于行的写入是否保留提供的主键值。

**返回类型：**

*InsertResult, error*

**返回值：**

返回插入的行数以及生成或提供的主键；如果请求构建或 RPC 失败，则同时返回错误。

**错误处理：**

- **error**

    验证、请求构建或 RPC 失败。请检查返回的错误以获取失败详情。

## Example\{#example}

演示 Insert() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256))
rows := []map[string]any{{"text": []string{"first", "second"}}}

result, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("books").
	WithInt64Column("id", []int64{1}).
	WithStructArrayColumn("chunks", structSchema, rows))
if err != nil {
	// handle error
}
_ = result
```
