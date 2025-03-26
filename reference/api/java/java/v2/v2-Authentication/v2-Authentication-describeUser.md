---
displayed_sidbar: javaSidebar
title: "describeUser() | Java | v2"
slug: /java/java/v2-Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
notebook: false
description: "This operation describes a specific user. | Java | v2"
type: docx
token: YLQJdvVA8odibAx7mQscYwMVn8g
sidebar_position: 6
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - describeUser()
  - javaV225
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeUser()

This operation describes a specific user.

```java
public DescribeUserResp describeUser(DescribeUserReq request)
```

## Request Syntax{#request-syntax}

```java
describeUser(DescribeUserReq.builder()
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String userName)`

    The name of the user to describe.

**RETURN TYPE:**

*DescribeUserResp*

**RETURNS:**

A **DescribeUserResp** object containing the details of the user.

**PARAMETERS:**

- **roles** (*List\<String\>*) -

    A list of role names associated with the user.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeUserReq describeUserReq = DescribeUserReq.builder()
        .userName("test")
        .build();
DescribeUserResp describeUserResp = client.describeUser(describeUserReq);
```

