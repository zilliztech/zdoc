---
title: "CreateCollection() | Go | v2"
slug: /go/go/v2-Collection-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "在自动验证公开 `Validate()` 方法的选项（包括结构体数组 Schema）后，创建一个 Collection。 | Go | v2"
type: docx
token: Jm5IdnexOoFaMpx0HqDcbXeDnGe
sidebar_position: 9
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大型语言模型
  - 向量化
  - zilliz
  - zilliz cloud
  - 云
  - CreateCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateCollection()

在自动验证公开 `Validate()` 方法的选项（包括结构体数组 Schema）后，创建一个 Collection。

```go
func (c *Client) CreateCollection(ctx context.Context, option CreateCollectionOption, callOptions ...grpc.CallOption) error
```

**参数：**

- **name** (*string*) -

    **[必需]**

    要创建的 Collection 的名称。

- **collectionSchema** (**entity.Schema*) -

    **[必需]**

    定义 Collection 字段和配置的 Schema。

**构建器方法：**

- `WithAutoID(autoID bool)`

    设置是否由 Milvus 自动生成主键。

- `WithShardNum(shardNum int32)`

    设置 Collection 的分片数量。

- `WithDynamicSchema(dynamicSchema bool)`

    启用或禁用动态字段。

- `WithVarcharPK(varcharPK bool, maxLen int)`

    使用具有指定最大长度的 VarChar 主键。

- `WithIndexOptions(indexOpts ...CreateIndexOption)`

    设置创建 Collection 时使用的索引创建选项。

- `WithProperty(key string, value any)`

    将值转换为其字符串表示形式后，设置 Collection 属性。

- `WithConsistencyLevel(cl entity.ConsistencyLevel)`

    设置 Collection 一致性级别。

- `WithMetricType(metricType entity.MetricType)`

    设置默认向量索引的度量类型。

- `WithPKFieldName(name string)`

    设置主键字段名称。

- `WithVectorFieldName(name string)`

    设置向量字段名称。

- `WithNumPartitions(numPartitions int64)`

    设置与 Partition 键配合使用的 Partition 数量。

**返回类型：**

*error*

**返回值：**

Collection 创建成功后返回 nil。Schema 验证或 RPC 失败时返回错误。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 CreateCollection() 的用法。

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

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
	WithField(entity.NewField().WithName("chunks").WithDataType(entity.FieldTypeArray).WithElementType(entity.FieldTypeStruct).WithStructSchema(structSchema))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("books", schema))
if err != nil {
	// handle error
}
```
