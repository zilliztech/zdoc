---
displayed_sidbar: javaSidebar
title: "describeRole() | Java | v2"
slug: /java/java/v2-Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
notebook: false
description: "This operation describes a specific role. | Java | v2"
type: docx
token: Fs7qdzeHZo305txlj45cgqoVnUf
sidebar_position: 3
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - describeRole()
  - javaV2
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: javaSidebar

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

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to describe.

**RETURN Type:**

*DescribeRoleResp.GrantInfo*

**RETURNS:**

A **DescribeRoleResp.GrantInfo** object representing the permissions assigned to the role.

**PARAMETERS:**

- **objectType** (*String*):
The type of the object being granted a privilege.

- **privilege** (*String*):
The specific privilege granted to the object.

- **objectName** (*String*):
The name of the object to which the privilege is granted.

- **dbName** (*String*):
The name of the database associated with the granted privilege.

- **grantor** (*String*):
The name of the entity (user or role) that granted the privilege.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig
import io.milvus.v2.client.MilvusClientV2
import io.milvus.v2.service.rbac.request.DescribeUserReq

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe a role
DescribeRoleReq describeRoleReq = DescribeRoleReq.builder()
        .roleName("test")
        .build();
client.describeRole(describeRoleReq);
```
