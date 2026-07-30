---
title: "ReleaseCollection() | Go | v2"
slug: /go/v2-Management-ReleaseCollection
sidebar_label: "ReleaseCollection()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method releases the specified collection. | Go | v2"
type: origin
token: ICyuweLbjiEjMkktBIzcLQTHnDc
sidebar_position: 9
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ReleaseCollection()

This method releases the specified collection.

```go
func (c *Client) LoadCollection(ctx context.Context, option LoadCollectionOption, callOptions ...grpc.CallOption) (LoadTask, error)
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
     <td><p><code>option</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><a href="./v2-Management-ReleaseCollection#releasecollectionoption"><code>ReleaseCollectionOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## ReleaseCollectionOption

This is an interface type. The `releaseCollectionOption` struct type implements this interface type. 

You can use the `NewReleaseCollectionOption()` function to get the concrete implementation.

### NewReleaseCollectionOption()

The signature of this method is as follows:

```go
func NewReleaseCollectionOption(collectionName string) *releaseCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>collectionName</code></p></td>
     <td><p>Name of the target collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

[`LoadTask`](./v2-Management-LoadCollection#loadtask)

## Example

```go
import (
        "context"
        "github.com/milvus-io/milvus/client/v2/milvusclient"
)

err = cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
if err != nil {
        // handle error
}
```
