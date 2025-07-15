---
title: "AddPrivilegesToGroup() | Go | v2"
slug: /go/v2-Authentication-AddPrivilegesToGroup
sidebar_label: "AddPrivilegesToGroup()"
beta: FALSE
notebook: FALSE
description: "This operation adds privileges to the specified privilege group. | Go | v2"
type: origin
token: IhFywoQmXiWRfHkO0IocUF9wn8e
sidebar_position: 1
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddPrivilegesToGroup()

This operation adds privileges to the specified privilege group.

```go
func (c *Client) AddPrivilegesToGroup(ctx context.Context, option AddPrivilegeToGroupOption, callOptions ...grpc.CallOption) error
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
     <td><p><code>AddPrivilegesToGroupOption</code></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## AddPrivilegeToGroupOption{#addprivilegetogroupoption}

This is an interface type. The `addPrivilegesToGroupOption` struct type implements this interface type. You can use `NewAddPrivilegesToGroupOption` to get the concrete implementation.

### NewAddPrivilegesToGroupOption{#newaddprivilegestogroupoption}

The signature of the `NewAddPrivilegesToGroupOption` is as follows:

```go
func NewAddPrivilegesToGroupOption(groupName string, privileges ...string) *addPrivilegeToGroupOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>groupName</code></p></td>
     <td><p>The name of the target privilege group.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>privileges</code></p></td>
     <td><p>The privileges to add into the above group.</p><p>For details, refer to .</p></td>
     <td><p><code>...string</code></p></td>
   </tr>
</table>

## grpc.CallOption{#grpccalloption}

This interface provided by the gRPC Go library allows you to specify additional options or configurations when making requests. For possible implementations of this interface, refer to [this file](https://github.com/grpc/grpc-go/blob/v1.69.4/rpc_util.go#L174).

## Return{#return}

Null

## Example{#example}

```go

```
