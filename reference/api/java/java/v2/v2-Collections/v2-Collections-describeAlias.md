---
displayed_sidbar: javaSidebar
title: "describeAlias() | Java | v2"
slug: /java/java/v2-Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
notebook: false
description: "This operation displays the details of an alias. | Java | v2"
type: docx
token: B57cdiaEkotJQnxl7I9cJqotnPb
sidebar_position: 8
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - javaV2
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeAlias()

This operation displays the details of an alias.

```java
public DescribeAliasResp describeAlias(DescribeAliasReq request)
```

## Request Syntax{#request-syntax}

```java
describeAlias(DescribeAliasReq.builder()
    .alias(String alias)
    .build()
)
```

**BUILDER METHODS:**

- `alias(String alias)`

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

**RETURN TYPE:**

*DescribeAliasResp*

**RETURNS:**

A **DescribeAliasResp** object containing the alias details.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
        .alias("test_alias")
        .build();
DescribeAliasResp describeAliasResp = client.describeAlias(describeAliasReq);
```

