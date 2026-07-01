---
title: "removeFileResource() | Java | v2"
slug: /java/java/v2-FileResources-removeFileResource
sidebar_key: java/v2-FileResources-removeFileResource
sidebar_label: "removeFileResource()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "Removes a previously uploaded file resource by name. Removing a resource that is still referenced by an active function or analyzer fails with an error. | Java | v2"
type: docx
token: I5yTdfJXNoHDICxSwWXcNjwxnoc
sidebar_position: 3
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - removeFileResource()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# removeFileResource()

Removes a previously uploaded file resource by name. Removing a resource that is still referenced by an active function or analyzer fails with an error.

```java
public void removeFileResource(RemoveFileResourceReq request)
```

## Request Syntax\{#request-syntax}

```java
removeFileResource(RemoveFileResourceReq.builder()
    .name(String name)
    .build()
);
```

**BUILDER METHODS:**

- `name(String name)` -

    **[REQUIRED]**

    The name of the file resource to remove.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.utility.request.RemoveFileResourceReq;

client.removeFileResource(RemoveFileResourceReq.builder()
    .name("stopwords")
    .build());
```
