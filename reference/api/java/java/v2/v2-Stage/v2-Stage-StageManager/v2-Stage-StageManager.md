---
title: "StageManager | Java | v2"
slug: /java/java/v2-Stage-StageManager
sidebar_label: "StageManager"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `StageManager` instance maintains a connection to Zilliz Cloud's Stage service. Before creating, listing, or deleting stages, you need to initiate a `StageManager` instance. | Java | v2"
type: docx
token: QHyGdm4FyoFwCzxDgUUc9yQrnPf
sidebar_position: 4
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - StageManager
  - javaV225
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# StageManager

A `StageManager` instance maintains a connection to Zilliz Cloud's Stage service. Before creating, listing, or deleting stages, you need to initiate a `StageManager` instance.

```java
io.milvus.bulkwriter.StageManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/manage-stages">Manage Stages</a>.</p>

</Admonition>

## Constructor{#constructor}

This constructor initializes a new `StageManager` instance designed to maintain a connection to Zilliz Cloud's Stage service.

```java
StageManager(
    StageManagerParam.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .build();
)
```

**PARAMETERS:**

- **cloudEndpoint** (*str*) -

    **&#91;REQUIRED&#93;**

    The Zilliz Cloud endpoint, which is `https:*//*api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **apiKey** (*str*) -

    **&#91;REQUIRED&#93;**

    Your Zilliz Cloud API key with sufficient permissions to manage stages on Zilliz Cloud's Stage service. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

**RETURN TYPE:**

`StageManager`

**RETURNS:**

A `StageManager` instance.

## Examples{#examples}

```java
import io.milvus.bulkwriter.StageManager;
import io.milvus.bulkwriter.StageManagerParam;

StageManagerParam stageManagerParam = StageManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
StageManager stageManager = new StageManager(stageManagerParam);
```

