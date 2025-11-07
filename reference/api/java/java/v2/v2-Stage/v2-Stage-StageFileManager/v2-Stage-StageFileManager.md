---
title: "StageFileManager | Java | v2"
slug: /java/java/v2-Stage-StageFileManager
sidebar_label: "StageFileManager"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `StageFileManager` instance maintains a connection to a specific stage on Zilliz Cloud's Stage service. Before uploading data files to a stage, you need to initiate a `StageFileManager` instance. | Java | v2"
type: docx
token: DK7ZdxRCyoepyxx0odzcH66xnu3
sidebar_position: 1
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - StageFileManager
  - javaV226
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# StageFileManager

A `StageFileManager` instance maintains a connection to a specific stage on Zilliz Cloud's Stage service. Before uploading data files to a stage, you need to initiate a `StageFileManager` instance.

```java
io.milvus.bulkwriter.StageFileManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/manage-stages">Manage Stages</a>.</p>

</Admonition>

## Constructor\{#constructor}

This constructor initializes a new `StageFileManager` instance designed to maintain a connection to a specific stage on Zilliz Cloud's Stage service.

```java
StageFileManager(
    StageFileManager.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .withStageName(String stageName)
        .build();
)
```

**PARAMETERS:**

- **cloudEndpoint** (*str*) -

    **[REQUIRED]**

    The Zilliz Cloud endpoint, which is `https:*//*api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **apiKey** (*str*) -

    **[REQUIRED]**

    Your Zilliz Cloud API key with sufficient permissions to manage stages on Zilliz Cloud's Control Plane. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

- **stageName** (*str*) -

    **[REQUIRED]**

    The name of the target stage of this operation.

**RETURN TYPE:**

`StageFileManager`

**RETURNS:**

A `StageFileManager` instance.

## Examples\{#examples}

```java
import io.milvus.bulkwriter.StageFileManager;
import io.milvus.bulkwriter.StageFileManagerParam;

StageFileManagerParam stageFileManagerParam = StageFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withStageName("my_stage")
    .build();

StageFileManager stageFileManager = new StageFileManager(stageFileManagerParam);
```

