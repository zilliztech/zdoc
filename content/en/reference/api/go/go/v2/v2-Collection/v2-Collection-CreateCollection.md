---
title: "CreateCollection() | Go | v2"
slug: /go/go/v2-Collection-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a new collection with the specified schema and options. | Go | v2"
type: docx
token: PP2kdYCHnoZQ96xJqWUcAW8enG9
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

This operation creates a new collection with the specified schema and options.

```go
func (c *Client) CreateCollection(ctx context.Context, option CreateCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewCreateCollectionOption(name, collectionSchema).
    WithAutoID(autoID).
    WithShardNum(shardNum).
    WithDynamicSchema(dynamicSchema).
    WithVarcharPK(varcharPK, maxLen).
    WithIndexOptions(indexOpts).
    WithProperty(key, value).
    WithConsistencyLevel(cl).
    WithMetricType(metricType).
    WithPKFieldName(name).
    WithVectorFieldName(name).
    WithNumPartitions(numPartitions)

// Alternative constructor(s):
// option := milvusclient.SimpleCreateCollectionOptions(name string, dim int64)

err := client.CreateCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*)

    The name of the target collection.

- **collectionSchema** (**[entity.Schema](./v2-Collection-Schema)*)

    The schema defining the collection fields and their data types.

**OPTION METHODS:**

- `WithAutoID(autoID bool)`

    Sets whether to automatically generate IDs for inserted entities.

- `WithShardNum(shardNum int32)`

    Sets the number of shards for data distribution across nodes.

- `WithDynamicSchema(dynamicSchema bool)`

    Enables or disables the dynamic schema feature for flexible field insertion.

- `WithVarcharPK(varcharPK bool, maxLen int)`

    Configures the collection to use varchar as the primary key type with a maximum length.

- `WithIndexOptions(indexOpts ...[CreateIndexOption](./v2-Management-CreateIndex#request-syntax))`

    Specifies the index options to apply when creating the collection.

- `WithProperty(key string, value any)`

    Sets a custom property key-value pair on the resource.

- `WithConsistencyLevel(cl [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    Sets the consistency level for the operation (Strong, Bounded, Session, or Eventually).

- `WithMetricType(metricType [entity.MetricType](./v2-Management-MetricType))`

    Sets the distance metric type for vector similarity search (e.g., COSINE, L2, IP).

- `WithPKFieldName(name string)`

    Sets the name of the primary key field.

- `WithVectorFieldName(name string)`

    Sets the name of the vector field.

- `WithNumPartitions(numPartitions int64)`

    Sets the number of partitions for the collection.

## Validation\{#validation}

CreateCollection validates the supplied schema before sending the request. In v2.6.5, struct-array field validation is applied automatically and invalid struct sub-field definitions return an error before the request is sent.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

indexOptions := []milvusclient.CreateIndexOption{
	milvusclient.NewCreateIndexOption(collectionName, "my_vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("my_vector"),
	milvusclient.NewCreateIndexOption(collectionName, "my_id", index.NewSortedIndex()).WithIndexName("my_id"),
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true).
	WithField(entity.NewField().WithName("my_id").WithIsAutoID(true).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
	WithField(entity.NewField().WithName("my_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5)).
	WithField(entity.NewField().WithName("my_varchar").WithDataType(entity.FieldTypeVarChar).WithMaxLength(512))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema).
	WithIndexOptions(indexOptions...),
)
if err != nil {
	// handle error
}
```
