---
title: "checkHealth() | Java | v2"
slug: /java/java/v2-Management-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks the health status of the current Milvus instance. | Java | v2"
type: docx
token: TSuFdRAGiopuefxPbEVczwlCnRg
sidebar_position: 19
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# checkHealth()

This operation checks the health status of the current Milvus instance.

```java
public CheckHealthResp checkHealth()
```

## Request syntax\{#request-syntax}

```java
CheckHealthResp()
```

**BUILDER METHODS:**

None

**RETURN TYPE:**

*CheckHealthResp*

**RETURNS:**

A **CheckHealthResp** object that contains detailed health information about the current Milvus instance. The object has the following fields:

**PARAMETERS:**

- **isHealthy** (*Boolean*) -

    Whether the current Milvus instance is in a healthy state.

- **reasons** (*List&lt;String&gt;*) -

    The unhealthy reasons, if the server is in an unhealthy state.

- **quotaStates** (*List&lt;String&gt;*) -

    The names of unhealthy states. The following names may appear in the list: "ReadLimited", "WriteLimited", "DenyToRead", "DenyToWrite", "DenyToDDL".

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.response.CheckHealthResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check healthy
CheckHealthResp healthyResp = client.checkHealth();
```
