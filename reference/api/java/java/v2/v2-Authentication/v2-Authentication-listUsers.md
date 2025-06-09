---
displayed_sidbar: javaSidebar
title: "listUsers() | Java | v2"
slug: /java/java/v2-Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
notebook: false
description: "This operation lists the names of all existing users. | Java | v2"
type: docx
token: EfM3drSXlo4Yzyxq2GpcmvoHnTm
sidebar_position: 15
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - listUsers()
  - javaV225
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listUsers()

This operation lists the names of all existing users.

```java
public List<String> listUsers()
```

## Request Syntax{#request-syntax}

```java
listUsers();
```

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of strings containing the user names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List users
List<String> resp = client.listUsers();
```

