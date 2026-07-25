---
title: "CreateRole() | Go | v2"
slug: /go/v2-Authentication-CreateRole
sidebar_label: "CreateRole()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method creates a role. In Milvus, you can allocate multiple privileges or privilege groups to a role and grant the role to a user so that the user gains the privileges allocated to the role. | Go | v2"
type: origin
token: X70ew0f1Ni1bXmks2qCcP2AKngb
sidebar_position: 3
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateRole()

This method creates a role. In Milvus, you can allocate multiple privileges or privilege groups to a role and grant the role to a user so that the user gains the privileges allocated to the role.

```go
func (c *Client) CreateRole(ctx context.Context, opt CreateRoleOption, callOpts ...grpc.CallOption) error
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
     <td><p><code>opt</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><a href="./v2-Authentication-CreateRole#createroleoption"><code>CreateRoleOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## CreateRoleOption

This is an interface type. The `createRoleOption` struct type implements this interface type. 

You can use the `NewCreateRoleOption()` function to get the concrete implementation.

### NewCreateRoleOption

The signature of the `NewCreateRoleOption()` is as follows:

```go
func NewCreateRoleOption(roleName string) *createRoleOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>roleName</code></p></td>
     <td><p>Name of the role to create.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## grpc.CallOption

This interface provided by the gRPC Go library allows you to specify additional options or configurations when making requests. For possible implementations of this interface, refer to [this file](https://github.com/grpc/grpc-go/blob/v1.69.4/rpc_util.go#L174).

## Return

Null

## Example

```go
import (
   "context"
   "google.golang.org/grpc"
   "github.com/milvus-io/milvus/client/v2/milvusclient"
)

roleName := "my_role"
opts := client.NewCreateRoleOption(roleName)

onFinish := func(ctx context.Context, err error) {
    if err != nil {
        fmt.Printf("gRPC call finished with error: %v\n", err)
    } else {
        fmt.Printf("gRPC call finished successfully")
    }
}

callOption := grpc.OnFinish(onFinish)

err := mclient.CreateRole(context.Background(), opts, callOpts)
```
