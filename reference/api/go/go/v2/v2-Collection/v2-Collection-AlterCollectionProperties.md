---
title: "AlterCollectionProperties() | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies properties of an existing collection. | Go | v2"
type: docx
token: DumcdeKcuoSJybxv0V5ckFrFnyg
sidebar_position: 5
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

This operation modifies properties of an existing collection.

```go
func (c *Client) AlterCollectionProperties(ctx context.Context, option AlterCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewAlterCollectionPropertiesOption(collection).
    WithProperty(key, value)

err := client.AlterCollectionProperties(ctx, option)
```

**PARAMETERS:**

- **[collection](./v2-Collection)** (*string*)

    The collection.

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
	"github.com/milvus-io/milvus/pkg/v2/common"
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

err = cli.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
	// handle error
}
```
