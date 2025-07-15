---
title: "BackupRBAC() | Go | v2"
slug: /go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC()"
beta: FALSE
notebook: FALSE
description: "This operation backs up your RBAC settings. | Go | v2"
type: origin
token: Rdz0wl2DAiMfKXkFnR7c9soYnMb
sidebar_position: 2
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BackupRBAC()

This operation backs up your RBAC settings.

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
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
     <td><p><code>opt</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><code>BackupRBACOption</code></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## BackupRBACOption{#backuprbacoption}

This is an interface type. The `NewBackupRBACOption()` function implements this interface type.

### NewBackupRBACOption(){#newbackuprbacoption}

The signature of the `NewBackupRBACOption()` is as follows:

```go
func NewBackupRBACOption() BackupRBACOption
```

This method has no parameters.

## entity.RBACMeta{#entityrbacmeta}

The `entity.RBACMeta` struct type is as follows:

```go
type RBACMeta struct {
    Users           []*entity.UserInfo
    Roles           []*entity.Role
    RoleGrants      []*entity.RoleGrants
    PrivilegeGroups []*entity.PrivilegeGroup
}
```

The struct types that appear in the `RBACMeta` struct are as follows:

- [entity.UserInfo](./v2-Authentication-BackupRBAC#entityuserinfo)

- [entity.Role](./v2-Authentication-DescribeRole#entityrole)

- [entity.RoleGrants](./v2-Authentication-BackupRBAC#entityrolegrants)

- [entity.PrivilegeGroup](./v2-Authentication-BackupRBAC#entityprivilegegroup)

## entity.UserInfo{#entityuserinfo}

The `entity.UserInfo` struct type is as follows:

```go
type UserInfo struct {
    Name  string
    Roles []string
    Password string
}
```

## entity.RoleGrants{#entityrolegrants}

The `RoleGrants` struct type is as follows:

```go
type RoleGrants struct {
    Object        string
    ObjectName    string
    RoleName      string
    GrantorName   string
    PrivilegeName string
    DbName        string
}
```

## entity.PrivilegeGroup{#entityprivilegegroup}

The `PrivilegeGroup` struct type is as follows:

```go
type PrivilegeGroup struct {
    GroupName  string
    Privileges []string
}
```

## Return{#return}

`*entity.RBACMeta`

## Example{#example}

```go

```
