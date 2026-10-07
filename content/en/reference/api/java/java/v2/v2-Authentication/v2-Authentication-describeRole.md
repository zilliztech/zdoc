---
title: "describeRole() | Java | v2"
slug: /java/java/v2-Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the privileges granted to a role and the role description. | Java | v2"
type: docx
token: ZmeDd4zoPo7EynxnyGOckvzvnsh
sidebar_position: 5
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - describeRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeRole()

This operation returns the privileges granted to a role and the role description.

```java
public DescribeRoleResp describeRole(DescribeRoleReq request)
```

## Request Syntax\{#request-syntax}

```java
DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName(String roleName)
    .build()
);
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    **[REQUIRED]**

    The name of the role to describe.

- `dbName(String dbName)`

    The name of the database that the role applies to. Defaults to the current database when omitted.

**RETURN TYPE:**

*DescribeRoleResp*

**RETURNS:**

A **DescribeRoleResp** object contains the following fields:

**PARAMETERS:**

- **roleName** (*String*) -

    The name of the role.

- **grantInfos** (*List&lt;GrantInfo&gt;*) -

    A list of the privileges granted to the role, each of which is a **GrantInfo** object containing the following fields:

    - **objectType** (*String*) -

        The type of the object to which the privilege applies.

    - **objectName** (*String*) -

        The name of the object to which the privilege applies.

    - **roleName** (*String*) -

        The name of the role to which the privilege is granted.

    - **grantor** (*String*) -

        The name of the user who granted the privilege.

    - **privilege** (*String*) -

        The granted privilege.

    - **dbName** (*String*) -

        The name of the database in which the privilege is granted.

- **description** (*String*) -

    The description of the role.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeRoleReq;
import io.milvus.v2.service.rbac.response.DescribeRoleResp;

DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName("analytics_reader")
    .build());
System.out.println(resp.getDescription());
```
