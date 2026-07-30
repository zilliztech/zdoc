---
title: "describeUser() | Java | v2"
slug: /java/java/v2-Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the roles assigned to a user and the user description. | Java | v2"
type: docx
token: TR9OdLX5PoMZbMx4l2tcWKVmn3b
sidebar_position: 6
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - describeUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeUser()

This operation returns the roles assigned to a user and the user description.

```java
public DescribeUserResp describeUser(DescribeUserReq request)
```

## Request Syntax\{#request-syntax}

```java
DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName(String userName)
    .build()
);
```

**BUILDER METHODS:**

- `userName(String userName)`

    **[REQUIRED]**

    The name of the user to describe.

**RETURNS:**

*DescribeUserResp*

The response contains `userName`, `roles`, and `description`.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeUserReq;
import io.milvus.v2.service.rbac.response.DescribeUserResp;

DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName("analyst_user")
    .build());
System.out.println(resp.getDescription());
```
