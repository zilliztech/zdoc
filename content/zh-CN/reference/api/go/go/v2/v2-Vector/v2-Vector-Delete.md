---
title: "Delete() | Go | v2"
slug: /go/v2-Vector-Delete
sidebar_label: "Delete()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method deletes data from a specific collection. | Go | v2"
type: origin
token: Nl51wq7jri12ark4Fh3cACY2n8g
sidebar_position: 3
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Delete()

This method deletes data from a specific collection.

```go
func (c *Client) Delete(ctx context.Context, option DeleteOption, callOptions ...grpc.CallOption) (DeleteResult, error)
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
     <td><p><a href="./v2-Vector-Delete#deleteoption"><code>DeleteOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## DeleteOption

This is an interface type. The `deleteOption` struct types implement this interface type. 

You can use the `NewDeleteOption` function to get the concrete implementation.

### NewDeleteOption

The signature of this method is as follows:

```go
func NewDeleteOption(collectionName string) *deleteOption
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

## DeleteResult

The `DeleteResult` struct type is as follows:

```go
type DeleteResult struct {
    DeleteCount int64
}
```

## Return

`DeleteResult`

## Example

```plaintext
res, err := cli.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{1, 2, 3}))
if err != nil {
    // handle error
}

fmt.Println(res.DeleteCount)
```

