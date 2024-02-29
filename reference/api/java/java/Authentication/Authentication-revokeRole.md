---
displayed_sidbar: javaSidebar
slug: /java/Authentication-revokeRole
beta: false
notebook: false
type: docx
token: I3TpdzCiroOEgfxElmhcJvBfn2d
sidebar_position: 12
---

import Admonition from '@theme/Admonition';


# revokeRole()

This operation revokes the role assigned to a user.

```java
public void revokeRole(RevokeRoleReq request)
```

## Request Syntax{#request-syntax}

```java
revokeRole(RevokeRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

__BUILDER METHODS:__

- `roleName(String roleName)`

    The name of the role to revoke.

- `userName(String userName)`

    The name of an existing user.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
RevokeRoleReq revokeRoleReq = RevokeRoleReq._builder_()
        .roleName("db_ro")
        .userName("test")
        .build();
client_v2.revokeRole(revokeRoleReq);
```

