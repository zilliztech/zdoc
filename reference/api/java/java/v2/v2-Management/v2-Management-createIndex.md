---
displayed_sidbar: javaSidebar
title: "createIndex() | Java | v2"
slug: /java/java/v2-Management-createIndex
sidebar_label: "createIndex()"
beta: false
notebook: false
description: "This operation creates an index for a specific collection. | Java | v2"
type: docx
token: OCjUdfc6eo0VihxNUGmcqb7FnTh
sidebar_position: 2
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - createIndex()
  - javaV225
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createIndex()

This operation creates an index for a specific collection.

```java
public void createIndex(CreateIndexReq request)
```

## Request Syntax{#request-syntax}

```java
createIndex(CreateIndexReq.builder()
    .collectionName(String collectionName)
    .indexParams(List<IndexParam> indexParams)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `indexParams(List<IndexParam> indexParams)`

    A list of **IndexParam** objects.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// create an index for field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType.L2)
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .fieldName("vector")
        .build();
CreateIndexReq createIndexReq = CreateIndexReq.builder()
        .collectionName("test")
        .indexParams(Collections.singletonList(indexParam))
        .build();
client.createIndex(createIndexReq);
```

