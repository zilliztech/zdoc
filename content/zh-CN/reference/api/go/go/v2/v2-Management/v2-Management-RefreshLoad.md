---
title: "RefreshLoad() | Go | v2"
slug: /go/v2-Management-RefreshLoad
sidebar_label: "RefreshLoad()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method refreshes the load state of the specified collection. | Go | v2"
type: origin
token: YlhLwS9n1inn7kk2jvpcLmxdnFd
sidebar_position: 12
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RefreshLoad()

This method refreshes the load state of the specified collection.

```go
func (c *Client) RefreshLoad(ctx context.Context, option RefreshLoadOption, callOptions ...grpc.CallOption) (LoadTask, error)
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
     <td><p><a href="./v2-Management-RefreshLoad#refreshloadoption"><code>RefreshLoadOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## RefreshLoadOption

This is an interface type. The `refreshLoadOption` struct type implements this interface type. 

You can use the `NewRefreshLoadOption()` function to get the concrete implementation.

### NewRefreshLoadOption()

The signature of this method is as follows:

```go
func NewRefreshLoadOption(collectionName string) *refreshLoadOption
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

loadTask, err := cli.RefreshLoad(ctx, milvusclient.NewRefreshLoadOption(collectionName))
if err != nil {
    // handle err
}
err = loadTask.Await(ctx)
if err != nil {
    // handler err
}
```
