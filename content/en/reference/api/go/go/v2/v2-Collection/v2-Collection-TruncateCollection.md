---
title: "TruncateCollection() | Go | v2"
slug: /go/go/v2-Collection-TruncateCollection
sidebar_label: "TruncateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes all data from a collection but retains the collection schema and structure | Go | v2"
type: docx
token: V7bwdcBPGosCFWxjYQfctDDInmb
sidebar_position: 24
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - TruncateCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# TruncateCollection()

This operation removes all data from a collection but retains the collection schema and structure

```go
func (c *Client) TruncateCollection(ctx context.Context, option TruncateCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
err := client.TruncateCollection(
    ctx, 
    milvusclient.NewTruncateCollectionOption("collection_name")
)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
package main

import (
    "context"
    "log"
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

func main() {
    ctx := context.Background()
    
    client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // Truncate collection
    err = client.TruncateCollection(ctx, milvusclient.NewTruncateCollectionOption("my_collection"))
    if err != nil {
        log.Printf("Failed to truncate collection: %v", err)
        return
    }
    
    log.Println("Collection truncated successfully")
}
```
