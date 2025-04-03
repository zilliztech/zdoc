---
displayed_sidbar: javaSidebar
title: "loadPartitions() | Java | v2"
slug: /java/java/v2-Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
notebook: false
description: "This operation releases the partitions in a specified collection from memory. | Java | v2"
type: docx
token: Jei2dpJMuoyOF5xTIuccfzcinOh
sidebar_position: 6
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitions()
  - javaV225
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# loadPartitions()

This operation releases the partitions in a specified collection from memory.

```java
public void loadPartitions(LoadPartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
loadPartitions(LoadPartitionsReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionNames(List<String> partitionNames)`

    A list of the names of the partitions to load.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// load partition in collection
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
        .collectionName("test")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.loadPartitions(loadPartitionsReq);
```

