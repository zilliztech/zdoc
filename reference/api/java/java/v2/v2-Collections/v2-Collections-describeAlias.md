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
sidebar_position: 11
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - javaV225
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
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

