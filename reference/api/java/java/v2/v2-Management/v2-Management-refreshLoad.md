---
displayed_sidbar: javaSidebar
title: "refreshLoad() | Java | v2"
slug: /java/java/v2-Management-refreshLoad
sidebar_label: "refreshLoad()"
beta: false
notebook: false
description: "This operation refreshes the load status of a specific collection. You can use this method to | Java | v2"
type: docx
token: Bg4Fd8bjLozCgxxpQb2cU6nznUc
sidebar_position: 12
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - refreshLoad()
  - javaV225
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# refreshLoad()

This operation refreshes the load status of a specific collection. You can use this method to 

```java
public Void refreshLoad(RefreshLoadReq request)
```

## Request Syntax{#request-syntax}

```java
refreshLoad(RefreshLoadReq.builder()
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `async(Boolean async)`

    Whether this operation is asynchronous.

    The value defaults to `Boolean.True`, indicating immediate return while the process may still run in the background.

- `timeout(Long timeout)`

    The timeout duration of the process. The process terminates after the specified duration expires.

    The value defaults to `60000L`, indicating the timeout duration is one minute.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// refresh the load status of the collection `test`
RefreshLoadReq refreshLoadReq = RefreshLoadReq.builder()
        .collectionName("test")
        .build();
client.refreshLoad(refreshLoadReq);
```

