---
displayed_sidbar: javaSidebar
slug: /java/Authentication-dropRole
beta: false
notebook: false
type: docx
token: ZQuwdm9z7ortkzxTJjfcCS9OnKQ
sidebar_position: 5
---

# dropRole()

This operation drops a custom role.

```java
public void dropRole(DropRoleReq request)
```

## Request Syntax{#request-syntax}

```java
dropRole(DropRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

__BUILDER METHODS:__

- `roleName(String roleName)`

    The name of the role to drop.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropRoleReq dropRoleReq = DropRoleReq._builder_()
        .roleName("test")
        .build();
client.dropRole(dropRoleReq);
```
