---
title: "DescribeSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation retrieves detailed metadata about a specific snapshot, including the source collection, partition names, creation timestamp, and storage location. | Go | v2"
type: docx
token: NM44dNuQtoKR9UxlEbqcZrVUnpb
sidebar_position: 2
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

This operation retrieves detailed metadata about a specific snapshot, including the source collection, partition names, creation timestamp, and storage location.

```go
func (c *Client) DescribeSnapshot(ctx context.Context, opt DescribeSnapshotOption, callOptions ...grpc.CallOption) (*milvuspb.DescribeSnapshotResponse, error)
```

## Request Syntax\{#request-syntax}

```go
option := client.NewDescribeSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

result, err := client.DescribeSnapshot(option)
```

**PARAMETERS:**

- **snapshotName** (*string*) - 

    The name of the snapshot to describe.

- **collectionName** (*string*) - 

    The name of the collection the snapshot belongs to.

**BUILDER METHODS:**

- `WithDbName(dbName string)`

    This sets the database to which the specified collection belongs.

**RETURN TYPE:**

*milvuspb.DescribeSnapshotResponse, error*

**RETURNS:**

A DescribeSnapshotResponse object containing detailed snapshot metadata.

```go
type DescribeSnapshotResponse struct {
    Name           string
    Description    string
    CollectionName string
    CreateTs       int64
    S3Location     string
    PartitionNames []string
}
```

**BUILDER METHODS:**

- **Name** (*string*) -

    The snapshot name.

- **Description** (*string*) -

    The snapshot description.

- **CollectionName** (*string*) -

    The source collection name.

- **CreateTs** (*int64*) -

    Creation timestamp in milliseconds.

- **S3Location** (*string*) -

    S3 storage location of the snapshot data.

- **PartitionNames** (*[]string*) -

    List of partition names included in the snapshot.

**EXCEPTIONS:**

- **error**

    Check err != nil for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewDescribeSnapshotOption("backup_20260418", "my_collection")

resp, err := cli.DescribeSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(resp.GetName())
fmt.Println(resp.GetCollectionName())
fmt.Println(resp.GetPartitionNames())
fmt.Println(resp.GetCreateTs())
fmt.Println(resp.GetS3Location())
```
