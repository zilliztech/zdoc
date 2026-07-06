---
title: "AddCollectionField() | Go | v2"
slug: /go/go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a new field to an existing collection schema. | Go | v2"
type: docx
token: QupedlVukov8hsxbSyOcrcI9nAb
sidebar_position: 1
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionField()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionField()

This operation adds a new field to an existing collection schema.

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewAddCollectionFieldOption(collectionName, field)

err := client.AddCollectionField(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

- **[field](./v2-Collection-Field)** (**[entity.Field](./v2-Collection-Field)*)

    The field.

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
	"log"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

// the field to add
// must be nullable for now
newField := entity.NewField().WithName("new_field").WithDataType(entity.FieldTypeInt64).WithNullable(true)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("customized_setup_2", newField))
if err != nil {
	// handle error
}
```
