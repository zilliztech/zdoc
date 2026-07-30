---
title: "truncateCollection() | Java | v2"
slug: /java/java/v2-Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.16
last_modified: v2.6.16
deprecate_since: false
notebook: false
description: "This operation removes all data from a collection while preserving the collection schema, indexes, and aliases. | Java | v2"
type: docx
token: JiLLdfLlPoKWL6xEgOAcdCU3nol
sidebar_position: 36
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - truncateCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# truncateCollection()

This operation removes all data from a collection while preserving the collection schema, indexes, and aliases.

```java
client.truncateCollection(TruncateCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
TruncateCollectionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .build()
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection to truncate.

- `databaseName(String databaseName)` -

    The name of the database containing the collection. If not specified, the default database is used.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException** - The specified collection does not exist or the server is unreachable.

## Example\{#example}

```java
import io.milvus.v2.service.collection.request.TruncateCollectionReq;

TruncateCollectionReq req = TruncateCollectionReq.builder()
    .collectionName("my_collection")
    .build();

client.truncateCollection(req);
```
