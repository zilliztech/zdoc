---
title: "CreatePrivilegeGroup() | Go | v2"
slug: /go/v2-Authentication-CreatePrivilegeGroup
sidebar_label: "CreatePrivilegeGroup()"
beta: FALSE
notebook: FALSE
description: "This method creates a privilege group that contains several privileges. You can grant a privilege group to a role in the same way as you would grant a privilege. | Go | v2"
type: origin
token: KMwbwqMP5ifjTAkCoQmcgm8LnTd
sidebar_position: 22
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreatePrivilegeGroup()

This method creates a privilege group that contains several privileges. You can grant a privilege group to a role in the same way as you would grant a privilege.

```go
func (c *Client) CreatePrivilegeGroup(ctx context.Context, option CreatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
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
     <td><p><code>CreatePrivilegeGroupOption</code></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## CreatePrivilegeGroupOption{#createprivilegegroupoption}

This is an interface type. The `createPrivilegeGroupOption` struct type implements this interface type. 

You can use the `NewCreatePrivilegeGroupOption()` function to get the concrete implementation.

### NewCreatePrivilegeGroupOption(){#newcreateprivilegegroupoption}

The signature of the `NewCreatePrivilegeGroupOption()` is as follows:

```go
func NewCreatePrivilegeGroupOption(groupName) *createPrivilegeGroupOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>groupName</code></p></td>
     <td><p>Name of the privilege group to create.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## grpc.CallOption{#grpccalloption}

This interface provided by the gRPC Go library allows you to specify additional options or configurations when making requests. For possible implementations of this interface, refer to [this file](https://github.com/grpc/grpc-go/blob/v1.69.4/rpc_util.go#L174).

## Return{#return}

Null

## Example{#example}

```go
import (
   "context"
   "google.golang.org/grpc"
   "github.com/milvus-io/milvus/client/v2/milvusclient"
)

privilegeGroupName := "my_privilege_group"

opts := client.NewCreatePrivilegeGroupOption(privilegeGroupName)

onFinish := func(ctx context.Context, err error) {
    if err != nil {
        fmt.Printf("gRPC call finished with error: %v\n", err)
    } else {
        fmt.Printf("gRPC call finished successfully")
    }
}

callOption := grpc.OnFinish(onFinish)

err := mclient.CreatePrivilegeGroup(context.Background(), opts, callOpts)
```

