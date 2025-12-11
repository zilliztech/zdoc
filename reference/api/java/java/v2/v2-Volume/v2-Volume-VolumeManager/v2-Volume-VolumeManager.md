---
title: "VolumeManager | Java | v2"
slug: /java/java/v2-Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "A `VolumeManager` instance maintains a connection to Zilliz Cloud's Volume service. Before creating, listing, or deleting volumes, you need to initiate a `VolumeManager` instance. | Java | v2"
type: docx
token: QHyGdm4FyoFwCzxDgUUc9yQrnPf
sidebar_position: 4
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeManager
  - javaV226
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeManager

A `VolumeManager` instance maintains a connection to Zilliz Cloud's Volume service. Before creating, listing, or deleting volumes, you need to initiate a `VolumeManager` instance.

```java
io.milvus.bulkwriter.VolumeManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A volume is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/volume">Volume</a>.</p>

</Admonition>

## Constructor\{#constructor}

This constructor initializes a new `VolumeManager` instance designed to maintain a connection to Zilliz Cloud's Volume service.

```java
VolumeManager(
    VolumeManagerParam.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .build();
)
```

**PARAMETERS:**

- **cloudEndpoint** (*str*) -

    **[REQUIRED]**

    The Zilliz Cloud endpoint, which is `https:*//*api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **apiKey** (*str*) -

    **[REQUIRED]**

    Your Zilliz Cloud API key with sufficient permissions to manage volumes on Zilliz Cloud's Volume service. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

**RETURN TYPE:**

`VolumeManager`

**RETURNS:**

A `VolumeManager` instance.

## Examples\{#examples}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

