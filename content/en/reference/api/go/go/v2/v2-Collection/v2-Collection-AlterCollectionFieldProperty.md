---
title: "AlterCollectionFieldProperty | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionFieldProperty
sidebar_label: "AlterCollectionFieldProperty"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation modifies the properties of a field in an existing collection. | Go | v2"
type: docx
token: DcWidpe28otXGSxUzvucDyrhnoc
sidebar_position: 4
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperty
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperty

This operation modifies the properties of a field in an existing collection.

```go
func (c *Client) AlterCollectionFieldProperty(ctx context.Context, option AlterCollectionFieldPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AlterCollectionFieldProperty().

```go
option := milvusclient.NewAlterCollectionFieldPropertiesOption(collectionName, fieldName).
    WithProperty(key, value)

err := client.AlterCollectionFieldProperty(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **fieldName** (*string*) -

    **[REQUIRED]**

    The fieldName for AlterCollectionFieldProperty.

**BUILDER METHODS:**

- `NewAlterCollectionFieldPropertiesOption(collectionName string, fieldName string)`

    Creates options to alter field properties. `collectionName` specifies the collection, and `fieldName` specifies the field whose properties are altered.

- `WithProperty(key string, value any)`

    Sets a field property key-value pair after converting the value to its string representation.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the field properties are altered. Returns an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Request construction or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AlterCollectionFieldProperty() usage.

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

err = cli.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("books", "title").
	WithProperty("max_length", "512"))
if err != nil {
	// handle error
}
```
