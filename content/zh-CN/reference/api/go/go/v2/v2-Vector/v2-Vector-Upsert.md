---
title: "Upsert() | Go | v2"
slug: /go/go/v2-Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "使用结构体数组和字段级数组操作对行或列执行 Upsert，并记录该操作的客户端遥测数据。 | Go | v2"
type: docx
token: PB5kdtzs8ok748xwRWacJbEUnze
sidebar_position: 19
keywords: 
  - milvus 向量 Database
  - milvus 数据库
  - milvus 向量 db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - Upsert()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Upsert()

使用结构体数组和字段级数组操作对行或列执行 Upsert，并记录该操作的客户端遥测数据。

```go
func (c *Client) Upsert(ctx context.Context, option UpsertOption, callOptions ...grpc.CallOption) (UpsertResult, error)
```

**参数：**

- **collName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **rows** (*...any*) -

    **[必需]**

    要插入或更新的一个或多个行值。

**构建器方法：**

- `WithColumns(columns ...column.Column)`

    此方法会将提供的列追加到写入请求中。

- `WithBoolColumn(colName string, data []bool)`

    此方法会追加一个具有指定名称和值的布尔标量列。

- `WithInt8Column(colName string, data []int8)`

    此方法会追加一个具有指定名称和值的 Int8 标量列。

- `WithInt16Column(colName string, data []int16)`

    此方法会追加一个具有指定名称和值的 Int16 标量列。

- `WithInt32Column(colName string, data []int32)`

    此方法会追加一个具有指定名称和值的 Int32 标量列。

- `WithInt64Column(colName string, data []int64)`

    此方法会追加一个具有指定名称和值的 Int64 标量列。

- `WithVarcharColumn(colName string, data []string)`

    此方法会追加一个具有指定名称和值的 VarChar 标量列。

- `WithFloatVectorColumn(colName string, dim int, data [][]float32)`

    此方法会追加一个具有指定名称、维度和值的浮点向量列。

- `WithFloat16VectorColumn(colName string, dim int, data [][]float32)`

    此方法会将提供的 float32 向量转换为 Float16 值，并追加生成的向量列。

- `WithBFloat16VectorColumn(colName string, dim int, data [][]float32)`

    此方法会将提供的 float32 向量转换为 BFloat16 值，并追加生成的向量列。

- `WithBinaryVectorColumn(colName string, dim int, data [][]byte)`

    此方法会追加一个具有指定名称、维度和值的二进制向量列。

- `WithInt8VectorColumn(colName string, dim int, data [][]int8)`

    此方法会追加一个具有指定名称、维度和值的 Int8 向量列。

- `WithStructArrayColumn(colName string, structSchema *entity.StructSchema, rows []map[string]any)`

    此方法会基于按行组织的子字段值追加一个 struct-array 列。每一行都是一个以子字段名为键的映射，并且每个值都必须与 structSchema 中声明的标量或向量类型匹配。

- `WithPartition(partitionName string)`

    此方法会为写入请求设置目标 Partition。

- `WithNamespace(namespace string)`

    WithNamespace 将写入范围限定到 Collection 命名空间。对于删除/upsert墓碑记录，主键仍然是 Collection 级别的，因此调用方必须确保同一 Collection 中跨命名空间的主键保持唯一。

- `WithPartialUpdate(partialUpdate bool)`

    此方法会为写入请求启用或禁用部分更新行为。

- `WithArrayAppend(fieldName string)`

    WithArrayAppend 声明在 Upsert 期间，Array 字段 `fieldName` 应使用 ARRAY_APPEND 语义进行合并。当存在任何非 REPLACE 操作时，服务器会隐式启用 partial_update，因此调用方无需额外调用 WithPartialUpdate(true)。

- `WithArrayRemove(fieldName string)`

    WithArrayRemove 声明在 Upsert 期间，Array 字段 `fieldName` 应使用 ARRAY_REMOVE 语义进行合并。有关隐式提升为 partial_update，请参见 WithArrayAppend。

- `WithFieldPartialOp(fieldName string, op schemapb.FieldPartialUpdateOp_OpType)`

    WithFieldPartialOp 会将显式的 FieldPartialUpdateOp 附加到名称为 `fieldName` 的字段。此方法适用于高级调用方；普通用户应优先使用特定操作的辅助方法（WithArrayAppend、WithArrayRemove）。

- `WithKeepAutoIDPk(keepPk bool)`

    此方法用于控制在启用自动 ID 生成时，基于行的写入是否保留提供的主键值。

**返回类型：**

*UpsertResult, error*

**返回值：**

返回受影响的行数和主键；如果请求构造或 RPC 失败，则同时返回错误。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 Upsert() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("books").
	WithInt64Column("id", []int64{1}).
	WithVarcharColumn("tags", []string{"featured"}).
	WithArrayAppend("tags"))
if err != nil {
	// handle error
}
_ = result
```
