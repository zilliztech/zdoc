---
title: "alterCollectionField() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionField
sidebar_label: "alterCollectionField()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies the properties of a specified collection field. | Java | v2"
type: docx
token: OtrZdy7OtoC9N9xb8TjcCtM7nfc
sidebar_position: 2
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionField()
  - javaV226
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionField()

This operation modifies the properties of a specified collection field.

```java
public Void alterCollectionField(AlterCollectionFieldReq request)
```

## Request Syntax\{#request-syntax}

```java
alterCollectionField(AlterCollectionFieldReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database that holds the target collection.

- `collectionName(String collectionName)`

    **[REQUIRED]**

    The name of the target collection.

- `fieldName(String fieldName)`

    **[REQUIRED]**

    The name of the target field.

- `properties(Map<String, String> properties)`

    **[REQUIRED]**

    The properties to modify and their expected values. Note that the property values should be strings. Available database properties are as follows:

    - **max_length** -

        The maximum byte length for strings allowed to be inserted. Note that multibyte characters (e.g., Unicode characters) may occupy more than one byte each, so ensure the byte length of inserted strings does not exceed the specified limit. Value range: [1, 65,535].

        This is mandatory for a varchar field.

    - **max_capacity** -

        The number of elements in an Array field value.

        This is mandatory for an array field.

    - **mmap_enabled** -

        Whether Milvus maps the field data into memory instead of fully loading it. For details, refer to MMap-enabled Data Storage.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionFieldReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `max_length` property of a VarChar field named `varchar`
Map<String, String> properties = new HashMap<>()
properties.put("max_length", "512")

AlterCollectionFieldReq alterCollectionFieldReq = AlterCollectionFieldReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .properties(properties)
        .build();
client.alterCollectionField(alterCollectionFieldReq)
```

