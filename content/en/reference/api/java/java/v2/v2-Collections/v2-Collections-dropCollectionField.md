---
title: "dropCollectionField() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Drops an existing collection field by field name or field ID. | Java | v2"
type: docx
token: PcFWdgr7VoPK74xt1mmcmH8gndf
sidebar_position: 39
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionField()

Drops an existing collection field by field name or field ID.

```java
public void dropCollectionField(DropCollectionFieldReq request)
```

## Request Syntax\{#request-syntax}

```java
DropCollectionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .fieldName(fieldName)
    .fieldId(fieldId)
    .build();
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of the target collection.

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `fieldName(String fieldName)`

    The name of the field to drop.

- `fieldId(Long fieldId)`

    The numeric ID of the field to drop when identifying it by ID.

**RETURNS:**

*void*

This operation does not return a value.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
    .collectionName("books")
    .fieldName("obsolete_field")
    .build());
```
