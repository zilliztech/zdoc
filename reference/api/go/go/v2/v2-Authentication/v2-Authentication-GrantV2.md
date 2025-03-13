---
title: "GrantV2() | Go | v2"
slug: /go/v2-Authentication-GrantV2
sidebar_label: "GrantV2()"
beta: FALSE
notebook: FALSE
description: "This method grants a privilege or a privilege group to a role. | Go | v2"
type: origin
token: En9vwAOryiuwHfkSJJXc9qBSnNh
sidebar_position: 10
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GrantV2()

This method grants a privilege or a privilege group to a role.

```plaintext
func (c *Client) GrantV2(ctx context.Context, option GrantV2Option, callOptions ...grpc.CallOption) error
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
     <td><p><code>GrantV2Option</code></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## GrantV2Option{#grantv2option}

This is an interface type. The `grantV2Option` struct type implements this interface type. 

You can use the `NewGrantV2Option()` function to get the concrete implementation.

### NewGrantV2Option{#newgrantv2option}

The signature of the `NewGrantV2Option()` is as follows:

```go
func NewGrantV2Option(roleName, privilegeName, dbName, collectionName string) *grantV2Option
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>roleName</code></p></td>
     <td><p>Name of the target role of this operation.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>privilegeName</code></p></td>
     <td><p>Name of the privilege or privilege group to assign. For details, refer to the <strong>Privilege name</strong> column in the table on page Users and Roles.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>dbName</code></p></td>
     <td><p>Name of the target database.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>collectionName</code></p></td>
     <td><p>Name of the target collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## grpc.CallOption{#grpccalloption}

This interface provided by the gRPC Go library allows you to specify additional options or configurations when making requests. For possible implementations of this interface, refer to [this file](https://github.com/grpc/grpc-go/blob/v1.69.4/rpc_util.go#L174).

## Return{#return}

Null

## Example{#example}

```go
// TODO 
// https://milvus.io/api-reference/pymilvus/v2.5.x/MilvusClient/Authentication/grant_privilege.md
```

