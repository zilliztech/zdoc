---
displayed_sidbar: javaSidebar
title: "listCollections() | Java | v2"
slug: /java/java/v2-Collections-listCollections
sidebar_label: "listCollections()"
beta: false
notebook: false
description: "This operation lists all existing collections. | Java | v2"
type: docx
token: WxhmdPZydowLVLxR2LacSrUNnme
sidebar_position: 21
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - javaV225
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listCollections()

This operation lists all existing collections.

```java
public ListCollectionsResp listCollections()
```

## Request Syntax{#request-syntax}

```java
listCollections()
```

**RETURN TYPE:**

*ListCollectionsResp*

**RETURNS:**

A **ListCollectionsResp** object containing a list of collection names. If there is not any collection, an empty list will be returned.

**PARAMETERS:**

- **collectionNames** (*List\<String\>*)

    A list of strings containing the names of all existing collections.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
ListAliasResp listAliasResp = client.listAliases();
```

