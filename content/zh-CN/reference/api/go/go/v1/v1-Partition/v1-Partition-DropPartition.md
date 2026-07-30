---
title: "DropPartition() | Go | v1"
slug: /go/v1-Partition-DropPartition
sidebar_label: "DropPartition()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "This method drops a specific partition from a collection. | Go | v1"
type: origin
token: ABvvwU8cOiGWBPkDSmycdHrXnUg
sidebar_position: 2
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropPartition()

This method drops a specific partition from a collection.

```go
func (c *GrpcClient) DropPartition(ctx context.Context, collName string, partitionName string) error
```

## Request Parameters

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>ctx</code></p></td>
     <td><p>Context for the current call to work.</p></td>
     <td><p><code>context.Context</code></p></td>
   </tr>
   <tr>
     <td><p><code>collName</code></p></td>
     <td><p>Name of a collection</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>partitionName</code></p></td>
     <td><p>Name of the partition to drop.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

Null

## Errors

Any error in the execution of the request. Possible errors are as follows:

- `ErrClientNotReady`: The client is not connected to Milvus.

- `ErrCollectionNotExists`: The specified collection does not exist.

- A partition with the specified name does not exist.

- The call to this API fails.

## Example

```go

```

