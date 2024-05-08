---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Authentication-grantRole
beta: FALSE
notebook: FALSE
type: docx
token: LKqbduwnVol3IAx053Pcp5rKnog
sidebar_position: 8
displayed_sidebar: javaSidebar

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

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to assign.

- `userName(String userName)`

    The name of an existing user.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GrantRoleReq grantRoleReq = GrantRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.grantRole(grantRoleReq);
```

