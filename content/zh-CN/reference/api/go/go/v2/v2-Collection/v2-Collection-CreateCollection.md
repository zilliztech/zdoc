---
title: "CreateCollection() | Go | v2"
slug: /go/go/v2-Collection-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "在自动验证公开 `Validate()` 方法的选项（包括结构体数组 schema）后创建集合。 | Go | v2"
type: docx
token: Jm5IdnexOoFaMpx0HqDcbXeDnGe
sidebar_position: 9
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - CreateCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateCollection()

在自动验证公开 `Validate()` 方法的选项（包括结构体数组 schema）后创建集合。

```go
func (c *Client) CreateCollection(ctx context.Context, option CreateCollectionOption, callOptions ...grpc.CallOption) error
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    要创建的集合名称。

- **collectionSchema** (**entity.Schema*) -

    **[REQUIRED]**

    定义集合字段和配置的 schema。

**BUILDER METHODS:**

- `WithAutoID(autoID bool)`

    设置是否由 Milvus 自动生成主键。

- `WithShardNum(shardNum int32)`

    设置集合的分片数量。

- `WithDynamicSchema(dynamicSchema bool)`

    启用或禁用动态字段。

- `WithVarcharPK(varcharPK bool, maxLen int)`

    使用具有指定最大长度的 VarChar 主键。

- `WithIndexOptions(indexOpts ...CreateIndexOption)`

    设置在创建集合期间使用的索引创建选项。

- `WithProperty(key string, value any)`

    在将值转换为其字符串表示后设置集合属性。

- `WithConsistencyLevel(cl entity.ConsistencyLevel)`

    设置集合的一致性级别。

- `WithMetricType(metricType entity.MetricType)`

    为默认向量索引设置度量类型。

- `WithPKFieldName(name string)`

    设置主键字段名称。

- `WithVectorFieldName(name string)`

    设置向量字段名称。

- `WithNumPartitions(numPartitions int64)`

    设置与分区键一起使用的分区数量。

**RETURN TYPE:**

*error*

**RETURNS:**

集合创建成功后返回 nil。schema 验证失败或 RPC 失败时返回错误。

**ERROR HANDLING:**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## Example\{#example}

演示 `CreateCollection()` 的用法。

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
