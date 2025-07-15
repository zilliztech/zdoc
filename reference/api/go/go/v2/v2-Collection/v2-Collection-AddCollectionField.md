---
title: "AddCollectionField() | Go | v2"
slug: /go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: FALSE
notebook: FALSE
description: "This operation adds a new scalar field to an existing collection without recreating it. The field becomes available almost immediately with minimal delay due to internal schema synchronization. | Go | v2"
type: origin
token: TO3YwPbU3iWqizkJPEBcXE03n9g
sidebar_position: 2
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddCollectionField()

This operation adds a new scalar field to an existing collection without recreating it. The field becomes available almost immediately with minimal delay due to internal schema synchronization.

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## Request Parameters{#request-parameters}

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
     <td><p><code>AddCollectionFieldOption</code></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## AddCollectionFieldOption{#addcollectionfieldoption}

This is an interface type. The `addCollectionFieldOption` struct type implements this interface. You can use `NewAddCollectionFieldOption()` to get its concrete implementation.

```go
func NewAddCollectionFieldOption(collectionName string, field *entity.Field) *addCollectionFieldOption
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
   <tr>
     <td><p><code>field</code></p></td>
     <td><p>The field to add.</p></td>
     <td><p><code>*entity.Field</code></p></td>
   </tr>
</table>

## Return{#return}

Null

## Example{#example}

```go
package main

import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

func main() {
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

    // the field to add
    // must be nullable for now
    newField := entity.NewField().WithName("new_field").WithDataType(entity.FieldTypeInt64).WithNullable(true)

    err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("customized_setup_2", newField))
    if err != nil {
        // handle error
    }
}

```
