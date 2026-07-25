---
title: "AlterCollectionProperties() | Go | v2"
slug: /go/v2-Collection-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method changes the specified properties of a collection. | Go | v2"
type: origin
token: L5CJwxseBio45VkAwtMcCK7RnQh
sidebar_position: 4
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

This method changes the specified properties of a collection.

```go
func (c *Client) AlterCollectionProperties(ctx context.Context, option AlterCollectionPropertiesOption, callOptions ...grpc.CallOption) error
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
     <td><p><a href="./v2-Collection-AlterCollectionProperties#altercollectionpropertiesoption"><code>AlterCollectionFieldPropertiesOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## AlterCollectionPropertiesOption

This is an interface type. The `alterCollectionPropertiesOption` struct type implements this interface type. 

You can use the `NewAlterCollectionPropertiesOption()` function to get the concrete implementation.

### NewAlterCollectionPropertiesOption

The signature of this method is as follows:

```go
func NewAlterCollectionPropertiesOption(collection string) *alterCollectionPropertiesOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>collection</code></p></td>
     <td><p>Name of the target collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

Null

## Example

```plaintext
err = cli.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    // handle error
}
```
