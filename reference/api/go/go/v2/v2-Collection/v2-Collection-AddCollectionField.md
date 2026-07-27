---
title: "AddCollectionField() | Go | v2"
slug: /go/go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Adds a nullable field to an existing collection after validating the field option on the client. | Go | v2"
type: docx
token: NmAwdxspJop8U0xi2DPcNYpmnBe
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

Adds a nullable field to an existing collection after validating the field option on the client.

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the collection to which the field is added.

- **field** (**entity.Field*) -

    **[REQUIRED]**

    The field definition to add. Vector fields must be nullable.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the field is added. Returns an error when client-side validation or the RPC fails.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates AddCollectionField() usage.

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

field := entity.NewField().
	WithName("new_field").
	WithDataType(entity.FieldTypeInt64).
	WithNullable(true)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books", field))
if err != nil {
	// handle error
}
```
