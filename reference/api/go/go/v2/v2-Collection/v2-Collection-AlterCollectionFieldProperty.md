---
title: "AlterCollectionFieldProperty() | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionFieldProperty
sidebar_label: "AlterCollectionFieldProperty()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies a property of a specific field in a collection. | Go | v2"
type: docx
token: MIyedieIBo43Yrxee0lcY3cUn8b
sidebar_position: 4
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperty()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperty()

This operation modifies a property of a specific field in a collection.

```go
func (c *Client) AlterCollectionFieldProperty(ctx context.Context, option AlterCollectionFieldPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewAlterCollectionFieldPropertiesOption(collectionName, fieldName).
    WithProperty(key, value)

err := client.AlterCollectionFieldProperty(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

- **fieldName** (*string*)

    The name of the field.

**OPTION METHODS:**

- `WithProperty(key string, value any)`

    Sets a custom property key-value pair on the resource.

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

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

err = cli.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("my_collection", "my_vector").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle error
}
```
