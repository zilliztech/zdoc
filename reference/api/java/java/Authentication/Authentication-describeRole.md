---
displayed_sidbar: javaSidebar
slug: /java/Authentication-describeRole
beta: false
notebook: false
type: docx
token: NVKMdnlOeoz770xHlt0cDHtgnym
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# describeRole()

This operation describes a specific role.

```java
public DescribeRoleResp describeRole(DescribeRoleReq request)
```

## Request Syntax{#request-syntax}

```java
describeRole(DescribeRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

__BUILDER METHODS:__

- `roleName(String roleName)`

    The name of the role to describe.

__RETURN Type:__

_DescribeRoleResp.GrantInfo_

__RETURNS:__

A __DescribeRoleResp.GrantInfo__ object representing the permissions assigned to the role.

__PARAMETERS:__

- __objectType__ (String):
The type of the object being granted a privilege.

- __privilege__ (String):
The specific privilege granted to the object.

- __objectName__ (String):
The name of the object to which the privilege is granted.

- __dbName__ (String):
The name of the database associated with the granted privilege.

- __grantor__ (String):
The name of the entity (user or role) that granted the privilege.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeRoleReq describeRoleReq = DescribeRoleReq._builder_()
        .roleName("test")
        .build();
client.describeRole(describeRoleReq);
```
