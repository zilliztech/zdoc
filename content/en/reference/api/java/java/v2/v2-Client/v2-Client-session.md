---
title: "session() | Java | v2"
slug: /java/java/v2-Client-session
sidebar_label: "session()"
beta: false
added_since: v3.0.2
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a session bound to a specific cluster ID for global-cluster deployments. Use it when you need DML or DQL operations to route to a chosen cluster instead of the current primary cluster. | Java | v2"
type: docx
token: Ay5BdddEboorRGxq3XacHXYHnwf
sidebar_position: 8
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - session()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# session()

This operation creates a session bound to a specific cluster ID for global-cluster deployments. Use it when you need DML or DQL operations to route to a chosen cluster instead of the current primary cluster.

```java
public MilvusClientV2Session session(String clusterId)
```

## Request Syntax\{#request-syntax}

```java
MilvusClientV2Session session = client.session(String clusterId);
```

**PARAMETERS:**

- `clusterId` (*String*) -

    **[REQUIRED]**

The ID of the cluster to bind the session to. The value cannot be null or empty. Operations invoked through the returned session route to this cluster.

**RETURN TYPE:**

*MilvusClientV2Session*

**RETURNS:**

The returned session exposes cluster-scoped variants of vector operations such as `search()`, `hybridSearch()`, `query()`, `get()`, `queryIterator()`, `searchIterator()`, and their supported async forms. Call `close()` when the session should no longer be used.

A **MilvusClientV2Session** object contains the following fields:

**PARAMETERS:**

- **clusterId** (*String*) -

    The ID of the cluster the session is bound to. Read it with `getClusterId()`. Operations invoked through the session route to this cluster.

**EXCEPTIONS:**

- **MilvusClientException**<br/>
  This exception will be raised if `clusterId` is null or empty.

- **MilvusClientException**<br/>
  This exception will be raised when any session operation fails.

## Example\{#example}

```java
import io.milvus.v2.client.MilvusClientV2Session;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

MilvusClientV2Session session = client.session("cluster-a");
try {
    QueryResp resp = session.query(QueryReq.builder()
        .collectionName("book_catalog")
        .filter("category == \"database\"")
        .outputFields(Arrays.asList("id", "title"))
        .limit(10)
        .build());
    System.out.println(resp.getQueryResults().size());
} finally {
    session.close();
}
```
