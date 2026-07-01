---
title: "flushAll() | Java | v2"
slug: /java/java/v2-Management-flushAll
sidebar_key: java/v2-Management-flushAll
sidebar_label: "flushAll()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation flushes insert buffers for all collections in a database. Use it before backup, verification, or workflows that require all recent writes to be persisted. | Java | v2"
type: docx
token: KQqgduahOo13yOxiRMgcfXQxnxd
sidebar_position: 25
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - flushAll()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# flushAll()

This operation flushes insert buffers for all collections in a database. Use it before backup, verification, or workflows that require all recent writes to be persisted.

```java
public FlushAllResp flushAll(FlushAllReq request)
```

## Request Syntax{#request-syntax}

```java
flushAll(FlushAllReq.builder()
    .databaseName(String databaseName)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build());
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The database whose collections should be flushed. Omit it to use the current database context.

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)`

    How long to wait for the flush-all operation to finish. Values greater than zero enable synchronous waiting.

**RETURNS:**

*FlushAllResp*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when validation fails or the server returns an error for this operation.

## Example{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

FlushAllResp resp = client.flushAll(FlushAllReq.builder()
    .databaseName("default")
    .waitFlushedTimeoutMs(60000L)
    .build());
System.out.println(resp.getFlushAllTs());
```

<!-- category: Management; action: CREATE; addedSince: v3.0.x -->
