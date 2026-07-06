---
title: "ListCollections() | Go | v2"
slug: /go/go/v2-Collection-ListCollections
sidebar_label: "ListCollections()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all collections in the current database. | Go | v2"
type: docx
token: AVEcd3SCwoRyiTxcNodcQAepnGf
sidebar_position: 21
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollections()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListCollections()

This operation lists all collections in the current database.

```go
func (c *Client) ListCollections(ctx context.Context, option ListCollectionOption, callOptions ...grpc.CallOption) (collectionNames []string, err error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewListCollectionOption()

result, err := client.ListCollections(ctx, option)
```

**RETURN TYPE:**

*collectionNames []string, err error*

**RETURNS:**

A list of names. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"
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

collectionNames, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	// handle error
}

fmt.Println(collectionNames)
```
