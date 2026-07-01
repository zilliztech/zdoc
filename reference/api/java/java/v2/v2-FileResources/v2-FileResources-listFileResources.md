---
title: "listFileResources() | Java | v2"
slug: /java/java/v2-FileResources-listFileResources
sidebar_key: java/v2-FileResources-listFileResources
sidebar_label: "listFileResources()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "Lists all uploaded file resources in the current database. | Java | v2"
type: docx
token: JbG0d6GAdoOpkixsVUpcE0YMnPd
sidebar_position: 2
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listFileResources()

Lists all uploaded file resources in the current database.

```java
public ListFileResourcesResp listFileResources(ListFileResourcesReq request)
```

## Request Syntax\{#request-syntax}

```java
listFileResources(ListFileResourcesReq.builder().build());
```

This request takes no parameters.

**RETURNS:**

*ListFileResourcesResp*

The response wraps `List<FileResourceInfo>` accessible via `getResources()`. Each `FileResourceInfo` entry has:

- `name` (*String*) - The unique name of the resource.

- `path` (*String*) - The original local path that was uploaded.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.utility.request.ListFileResourcesReq;
import io.milvus.v2.service.utility.response.ListFileResourcesResp;
import io.milvus.v2.service.utility.response.FileResourceInfo;

ListFileResourcesResp resp = client.listFileResources(
    ListFileResourcesReq.builder().build()
);
for (FileResourceInfo res : resp.getResources()) {
    System.out.println(res.getName() + " → " + res.getPath());
}
```
