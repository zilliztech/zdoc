---
title: "Flush() | Go | v1"
slug: /go/v1-Collection-Flush
sidebar_label: "Flush()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "This method synchronously stores entities from memory to storage and returns when the operations on every segments are complete. | Go | v1"
type: origin
token: CxPiwKWyZiFeQXkLvCAclaCKnDc
sidebar_position: 16
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Flush()

This method synchronously stores entities from memory to storage and returns when the operations on every segments are complete.

```go
func (c *GrpcClient) Flush(ctx context.Context, collName string, async bool, opts ...FlushOption) error
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
     <td><p>Name of a collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>async</code></p></td>
     <td><p>Whether this operation is asynchronous</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

## Return

Null

## Errors

Any error in the execution of the request. Possible errors are as follows:

- `ErrClientNotReady`: The client is not connected to Milvus.

- `ErrCollectionNotExists`: The collection with the specified name does not exist.

- The call to this API fails.

## Example

```go
// flush
err := mc.Flush(context.Background(), collectionName, false)
if err != nil {
   log.Fatal("failed to flush collection:", err.Error())
}
```

