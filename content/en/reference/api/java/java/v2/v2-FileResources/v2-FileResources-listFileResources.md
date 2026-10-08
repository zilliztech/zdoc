---
title: "listFileResources() | Java | v2"
slug: /java/java/v2-FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all uploaded file resources in the current database. | Java | v2"
type: docx
token: JbG0d6GAdoOpkixsVUpcE0YMnPd
sidebar_position: 2
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listFileResources()

This operation lists all uploaded file resources in the current database.

```java
public ListFileResourcesResp listFileResources(ListFileResourcesReq request)
```

## Request Syntax\{#request-syntax}

```java
listFileResources(ListFileResourcesReq.builder().build());
```

This request takes no parameters.

**RETURN TYPE:**

*ListFileResourcesResp*

**RETURNS:**

A **ListFileResourcesResp** object that contains the registered file resources.

**PARAMETERS:**

- **resources** (*List&lt;FileResourceInfo&gt;*) -

    The file resources registered in the current database, accessible via `getResources()`. Each **FileResourceInfo** entry contains the following fields:

    - **name** (*String*) -

        The unique name of the resource.

    - **path** (*String*) -

        The original local path that was uploaded.

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
