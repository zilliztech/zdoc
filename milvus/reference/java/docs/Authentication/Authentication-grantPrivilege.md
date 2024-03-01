---
displayed_sidbar: javaSidebar
slug: /java/Authentication-grantPrivilege
beta: false
notebook: false
type: docx
token: R2U5dSmSkoAFFwxWFoCckcSvnxe
sidebar_position: 7
---

# grantPrivilege()

This operation assigns a privilege to a role.

```java
public void grantPrivilege(GrantPrivilegeReq request)
```

## Request Syntax{#request-syntax}

```java
grantPrivilege(GrantPrivilegeReq.builder()
    .objectName(String objectName)
    .objectType(String objectType)
    .privilege(String privilege)
    .roleName(String roleName)
    .build()
)
```

__BUILDER METHODS:__

- `objectName(String objectName)`

    The name of the API to assign. 

    You can either use the wildcard (*) to include all applicable APIs in the specified privilege or fill in a specific API. For details, refer to the Relevant API column in the table on page [Users and Roles](https://milvus.io/docs/users_and_roles.md).

- `objectType(String objectType)`

    The type of the privilege object to assign. 

    Possible values are __Global__, __Collection__, and __User__.

- `privilege(String privilege)`

    The name of the privilege to assign. 

    For details, refer to the __Privilege name__ column in the table on page [Users and Roles](https://milvus.io/docs/users_and_roles.md).

- `roleName(String roleName)`

    The name of the role to assign privileges to.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GrantPrivilegeReq grantPrivilegeReq = GrantPrivilegeReq._builder_()
        .roleName("db_rw")
        .objectName("")
        .objectType("")
        .privilege("")
        .build();
client.grantPrivilege(grantPrivilegeReq);
```
