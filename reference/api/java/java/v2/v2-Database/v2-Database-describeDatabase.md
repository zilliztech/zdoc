---
displayed_sidbar: javaSidebar
title: "describeDatabase() | Java | v2"
slug: /java/java/v2-Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
notebook: false
description: "This operation gets detailed information about a specific database. | Java | v2"
type: docx
token: MJjHd3uGcoxEYBx0laKcAIKNnhg
sidebar_position: 3
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - javaV225
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeDatabase()

This operation gets detailed information about a specific database.

```java
public DescribeDatabaseResp describeDatabase(DescribeDatabaseReq request)
```

## Request Syntax{#request-syntax}

```java
describeDatabase(DescribeDatabaseReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database.

**RETURN TYPE**:

*DescribeDatabaseResp*

**RETURNS:**

A **DescribeDatabaseResp** object that contains detailed information about the specified database.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeDatabaseResp descResp = client.describeDatabase(DescribeDatabaseReq.builder()
        .databaseName(databaseName)
        .build());
Map<String,String> propertiesResp = descResp.getProperties();
System.out.println(propertiesResp.get(Constant.DATABASE_REPLICA_NUMBER));
```

