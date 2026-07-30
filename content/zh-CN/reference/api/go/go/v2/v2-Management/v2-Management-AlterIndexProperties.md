---
title: "AlterIndexProperties() | Go | v2"
slug: /go/v2-Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This operation changes the values of the specified index properties. | Go | v2"
type: origin
token: PNgAwd83viY5lsk58tHcWrfynPb
sidebar_position: 1
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

This operation changes the values of the specified index properties.

```go
func (c *Client) AlterIndexProperties(ctx context.Context, opt AlterIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Parameter

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
     <td><p><a href="./v2-Management-AlterIndexProperties#alterindexpropertiesoption"><code>AlterIndexPropertiesOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## AlterIndexPropertiesOption

This is an interface type.  The `alterIndexPropertiesOption` struct type implements this interface. You can use `NewAlterIndexPropertiesOption()` to get its concrete implementation.

```go
func NewAlterIndexPropertiesOption(collectionName string, indexName string) *alterIndexPropertiesOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>collectionName</code></p></td>
     <td><p>Name of the target collection of this operation.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>indexName</code></p></td>
     <td><p>Name of the index within the above-specified collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

Null

## Example

```go

```

