---
title: "addFileResource() | Java | v2"
slug: /java/java/v2-FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Uploads a local file as a named resource so it can be referenced by other Milvus operations (e.g., functions, analyzers). Names are unique per database — re-using a name overwrites the existing resource. | Java | v2"
type: docx
token: H0kadFay8oD1d0xserJcuL8wnhf
sidebar_position: 1
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - addFileResource()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFileResource()

Uploads a local file as a named resource so it can be referenced by other Milvus operations (e.g., functions, analyzers). Names are unique per database — re-using a name overwrites the existing resource.

```java
public void addFileResource(AddFileResourceReq request)
```

## Request Syntax\{#request-syntax}

```java
addFileResource(AddFileResourceReq.builder()
    .name(String name)
    .path(String path)
    .build()
);
```

**BUILDER METHODS:**

- `name(String name)` -

    **[REQUIRED]**

    The unique name of the file resource.

- `path(String path)` -

    **[REQUIRED]**

    The local filesystem path of the file to upload.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.utility.request.AddFileResourceReq;

client.addFileResource(AddFileResourceReq.builder()
    .name("stopwords")
    .path("/data/stopwords-en.txt")
    .build());
```
