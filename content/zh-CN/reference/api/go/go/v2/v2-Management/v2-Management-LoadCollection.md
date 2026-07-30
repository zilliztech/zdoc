---
title: "LoadCollection() | Go | v2"
slug: /go/v2-Management-LoadCollection
sidebar_label: "LoadCollection()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method loads the specified collection. | Go | v2"
type: origin
token: OmqGwFub5i55uzk0jbTc0fn1nEf
sidebar_position: 7
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# LoadCollection()

This method loads the specified collection.

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
     <td><p><a href="./v2-Management-LoadCollection#loadcollectionoption"><code>LoadCollectionOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## LoadCollectionOption

This is an interface type. The `loadCollectionOption` struct type implements this interface type. 

You can use the `NewLoadCollectionOption()` function to get the concrete implementation.

### NewLoadCollectionOption()

The signature of this method is as follows:

```go
func NewLoadCollectionOption(collectionName string) *loadCollectionOption
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

## LoadTask

This is a struct type that contains information about the current load operation. You can use the following methods to operate this struct type.

### Await()

A load operation is always asynchronous. You can use this method to wait until the load operation finishes.

```go
func (t *LoadTask) Await(ctx context.Context) error
```

## Return

[`LoadTask`](./v2-Management-LoadCollection#loadtask)

## Example

```go
loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("customized_setup_1"))
if err != nil {
    // handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
    // handle error
}

```
