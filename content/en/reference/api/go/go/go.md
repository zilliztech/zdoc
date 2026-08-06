---
title: "Go SDK Reference | Cloud"
displayed_sidebar: goSidebar
slug: /go
sidebar_label: "Overview"
sidebar_position: 3
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Go SDK Reference

The Go SDK provides a native Go client for Zilliz Cloud. The current v2 module is maintained under the `client/` directory of the main Milvus repository and exposes the `milvusclient` package for connection management, collection operations, data writes, vector search, and cluster administration.

## Features

- **Idiomatic Go client** — Create a `milvusclient.Client` with `context.Context` and a typed `ClientConfig`.
- **Option-based requests** — Configure operations with constructors such as `NewListCollectionOption()` and chainable option methods.
- **Collection and index management** — Define schemas, create collections and indexes, and manage collection loading.
- **Data and vector operations** — Insert, upsert, delete, query, search, and run hybrid searches with typed vectors and result sets.
- **Cloud administration** — Manage databases, partitions, aliases, users, roles, and resource groups available to your cluster.
- **Go ecosystem integration** — Pass contexts and optional gRPC call options through SDK operations and close clients explicitly when work is complete.

## Installation

Install the current v2 module and its dependencies with `go get`:

```bash
go get -u github.com/milvus-io/milvus/client/v2
```

Use the Go version required by the selected SDK module's `go.mod` file.

## Connect to Zilliz Cloud

Copy the public endpoint from the cluster **Connect** card and use an API key or cluster credential as the token.

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
	APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
	log.Fatal(err)
}
defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(
	ctx,
	milvusclient.NewListCollectionOption(),
)
if err != nil {
	log.Fatal(err)
}

fmt.Println(collectionNames)
```

## Resources

- [Go SDK v2 Reference](./v2)
- [Go SDK v2 source](https://github.com/milvus-io/milvus/tree/master/client)
- [Go package documentation](https://pkg.go.dev/github.com/milvus-io/milvus/client/v2)

import DocCardList from '@theme/DocCardList';

<DocCardList />
