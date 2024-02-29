---
displayed_sidbar: javaSidebar
slug: /java/Authentication-grantRole
beta: false
notebook: false
type: docx
token: LKqbduwnVol3IAx053Pcp5rKnog
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# grantRole()

This operation grants a role to a user.

```java
public void grantRole(GrantRoleReq request)
```

## Request Syntax{#request-syntax}

```java
grantRole(GrantRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

__BUILDER METHODS:__

- `roleName(String roleName)`

    The name of the role to assign.

- `userName(String userName)`

    The name of an existing user.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GrantRoleReq grantRoleReq = GrantRoleReq._builder_()
        .roleName("db_ro")
        .userName("test")
        .build();
client.grantRole(grantRoleReq);
```

