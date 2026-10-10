---
title: "PinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation pins snapshot data for a collection, preventing it from being garbage collected. Returns a pin ID that can be used to unpin the data later. | Go | v2"
type: docx
token: HmEkdVsmRoc2TbxEjtkcKChfnEf
sidebar_position: 8
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - PinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

This operation pins snapshot data for a collection, preventing it from being garbage collected. Returns a pin ID that can be used to unpin the data later.

```go
func (c *Client) PinSnapshotData(ctx context.Context, opt PinSnapshotDataOption, callOptions ...grpc.CallOption) (int64, error)
```

## Request Syntax\{#request-syntax}

Creates the request for PinSnapshotData().

```go
option := milvusclient.NewPinSnapshotDataOption("my_snapshot", "my_collection").
    WithDbName("my_db").
    WithTTL(3600)

pinID, err := cli.PinSnapshotData(ctx, option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the collection to create.

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewPinSnapshotDataOption(name string, collectionName string)`

    This creates an option to pin snapshot data for the specified collection.

- `WithDbName(dbName string)`

    This sets the database name for the collection.

- `WithTTL(ttlSeconds int64)`

    This sets the time-to-live for the pin in seconds.

**RETURN TYPE:**

*int64, error*

**RETURNS:**

The pin ID on success, or an error if the operation fails.

**PARAMETERS:**

- **result** (*int64*) -

    The int64 value returned by PinSnapshotData().

**ERROR HANDLING:**

- **error**

    The operation fails. Check err != nil for failure details.

## Example\{#example}

Demonstrates PinSnapshotData() usage.

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

pinID, err := cli.PinSnapshotData(ctx, milvusclient.NewPinSnapshotDataOption("my_snapshot", "quick_setup"))
if err != nil {
	log.Fatal("failed to pin snapshot data: ", err.Error())
}

fmt.Println("Pin ID:", pinID)
```
