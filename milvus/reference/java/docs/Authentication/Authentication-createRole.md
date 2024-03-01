---
displayed_sidbar: javaSidebar
slug: /java/Authentication-createRole
beta: false
notebook: false
type: docx
token: HqWSdtWyyoyT12xJLyrcvqU5ndg
sidebar_position: 1
---

# createRole()

This operation creates a custom role.

```java
public void createRole(CreateRoleReq request)
```

## Request Syntax{#request-syntax}

```java
createRole(CreateRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

__BUILDER METHODS:__

- `roleName(String roleName)`

    The name of the role to create.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateRoleReq createRoleReq = CreateRoleReq._builder_()
        .roleName("test")
        .build();
client.createRole(createRoleReq);
```
