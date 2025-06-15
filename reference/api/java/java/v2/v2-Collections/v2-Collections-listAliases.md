---
displayed_sidbar: javaSidebar
title: "listAliases() | Java | v2"
slug: /java/java/v2-Collections-listAliases
sidebar_label: "listAliases()"
beta: false
notebook: false
description: "This operation lists all existing aliases for a specific collection. | Java | v2"
type: docx
token: RvZDdxU1howmQ7x2V31c8eC7nJb
sidebar_position: 19
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - javaV225
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listAliases()

This operation lists all existing aliases for a specific collection.

```java
public ListAliasResp listAliases()
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2.listAliases()
```

**RETURN TYPE:**

*ListAliasResp*

**RETURNS:**

A **ListAliasResp** object containing a list of aliases for the specified collection. If the collection has no aliases, an empty list will be returned.

**PARAMETERS:**

- **alias** (*List\<String\>*)

    A list of strings containing the aliases.

- **collectionName** (*String*)

    The name of the collection.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.ListAliasesReq;
import io.milvus.v2.service.utility.response.ListAliasResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List aliases
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
        .collectionName("test")
        .build();
ListAliasResp listAliasResp = client.listAliases(listAliasesReq);
```
