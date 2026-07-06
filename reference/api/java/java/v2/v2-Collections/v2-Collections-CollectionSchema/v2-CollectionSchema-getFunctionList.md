---
title: "getFunctionList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFunctionList
sidebar_label: "getFunctionList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This getter returns the list of functions defined in the collection schema. | Java | v2"
type: docx
token: UJg8dnXiUoB6FnxanBicIzcLnsb
sidebar_position: 6
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctionList()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctionList()

This getter returns the list of functions defined in the collection schema.

```java
public List<CreateCollectionReq.Function> getFunctionList()
```

**RETURNS:**

*List&lt;CreateCollectionReq.Function&gt;*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.Function> functions = schema.getFunctionList();
```
