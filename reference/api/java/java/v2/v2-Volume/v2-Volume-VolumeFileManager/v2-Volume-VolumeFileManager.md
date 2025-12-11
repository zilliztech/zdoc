---
title: "VolumeFileManager | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "A `VolumeFileManager` instance maintains a connection to a specific volume on Zilliz Cloud's Volume service. Before uploading data files to a volume, you need to initiate a `VolumeFileManager` instance. | Java | v2"
type: docx
token: DK7ZdxRCyoepyxx0odzcH66xnu3
sidebar_position: 2
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeFileManager
  - javaV226
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeFileManager

A `VolumeFileManager` instance maintains a connection to a specific volume on Zilliz Cloud's Volume service. Before uploading data files to a volume, you need to initiate a `VolumeFileManager` instance.

```java
io.milvus.bulkwriter.VolumeFileManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A volume is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/volume">Volume</a>.</p>

</Admonition>

## Constructor\{#constructor}

This constructor initializes a new `VolumeFileManager` instance designed to maintain a connection to a specific volume on Zilliz Cloud's Volume service.

```java
VolumeFileManager(
    VolumeFileManager.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .withVolumeName(String volumeName)
        .build();
)
```

**PARAMETERS:**

- **cloudEndpoint** (*str*) -

    **[REQUIRED]**

    The Zilliz Cloud endpoint, which is `https://api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **apiKey** (*str*) -

    **[REQUIRED]**

    Your Zilliz Cloud API key with sufficient permissions to manage volumes on Zilliz Cloud's Control Plane. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

- **volumeName** (*str*) -

    **[REQUIRED]**

    The name of the target volume of this operation.

**RETURN TYPE:**

`VolumeFileManager`

**RETURNS:**

A `VolumeFileManager` instance.

## Examples\{#examples}

```java
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;

VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withVolumeName("my_volume")
    .build();

VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
```

