---
title: "grantPrivilege() | Java | v2"
slug: /java/java/v2-Authentication-grantPrivilege
sidebar_label: "grantPrivilege()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation assigns a privilege to a role. | Java | v2"
type: docx
token: LcitdP8NuoIahexCUMQcOgg2nYg
sidebar_position: 10
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - grantPrivilege()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# grantPrivilege()

This operation assigns a privilege to a role.

```java
public void grantPrivilege(GrantPrivilegeReq request)
```

## Request Syntax\{#request-syntax}

```java
grantPrivilege(GrantPrivilegeReq.builder()
    .roleName(String roleName)
    .dbName(String dbName)
    .objectType(String objectType)
    .privilege(String privilege)
    .objectName(String objectName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to assign privileges to.

- `dbName(String dbName)`

    The name of the database in which the privilege applies. Defaults to the current database when omitted.

- `objectType(String objectType)`

    The type of the object for which the privilege is being assigned.

    Possible values:

    - **Global**: System-wide objects, allowing the user to perform actions that affect all collections, users, or system-wide settings. When **objectType** is set to **Global**, set **objectName** to the wildcard (**&ast;**), indicating all objects of the specified type.

    - **Collection**: Collection-specific objects, allowing the user to perform actions such as creating indexes, loading data, inserting or deleting data, and querying data within a specific collection.

    - **User**: Objects related to user management, allowing the user to manage credentials and roles for database users, such as updating user credentials or viewing user details.

- `privilege(String privilege)`

    The name of the privilege to assign.

    For details, refer to the **Privilege name** column in the table on page [Manage Cluster Roles(SDK)](/docs/cluster-roles-sdk).

- `objectName(String objectName)`

    The name of the object to control access for. For example, if the object type is **Collection**, the object name is the name of a collection. If the object type is **User**, the object name is the name of a database user.

    When **object_type** is set to **Global**, set **object_name** to the wildcard (**&ast;**), indicating all objects of the specified type. For details, refer to the Relevant API column in the table on page [Manage Cluster Roles(SDK)](/docs/cluster-roles-sdk).

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantPrivilegeReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant privileges
GrantPrivilegeReq grantPrivilegeReq = GrantPrivilegeReq.builder()
        .roleName("db_rw")
        .objectType("User")
        .objectName("user_1")
        .privilege("SelectUser")
        .build();
client.grantPrivilege(grantPrivilegeReq);
```
