---
title: "FunctionChainStage | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainStage
sidebar_label: "FunctionChainStage"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A FunctionChainStage instance specifies the execution stage where a function chain runs. Numeric values mirror the gRPC `FunctionChainStage` message. | Java | v2"
type: docx
token: E1GAdX9woo39BTxEwfocb6fVnCb
sidebar_position: 5
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionChainStage
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainStage

A FunctionChainStage instance specifies the execution stage where a function chain runs. Numeric values mirror the gRPC `FunctionChainStage` message.

```java
io.milvus.v2.service.vector.request.FunctionChainStage
```

## Constants\{#constants}

- **UNSPECIFIED**

    An unset stage.

- **INGESTION**

    Runs during data ingestion.

- **PRE_PROCESS**

    Runs before the search.

- **L0_RERANK**

    The first rerank stage applied to search results.

- **L1_RERANK**

    The second rerank stage applied to search results.

- **L2_RERANK**

    The third rerank stage applied to search results.

- **POST_PROCESS**

    Runs after the search.

## Example\{#example}

```java
FunctionChain chain = FunctionChain.builder()
        .stage(FunctionChainStage.L2_RERANK)
        .name("fresh_popular_rerank")
        .build();
```
