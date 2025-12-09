---
title: "VolumeManager | Python"
slug: /python/python/Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "A `VolumeManager` instance maintains a connection to Zilliz Cloud's Volume service. Before creating, listing, or deleting volumes, you need to initiate a `VolumeManager` instance. | Python"
type: docx
token: XdZ6dFzA3oUu4dxWh7Kcz4dhnQg
sidebar_position: 4
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeManager
  - pymilvus26
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeManager

A `VolumeManager` instance maintains a connection to Zilliz Cloud's Volume service. Before creating, listing, or deleting volumes, you need to initiate a `VolumeManager` instance.

```python
class pymilvus.bulk_writer.volume_manager import VolumeManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A volume is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/volume">Volume</a>.</p>

</Admonition>

## Constructor\{#constructor}

This constructor initializes a new `VolumeManager` instance designed to maintain a connection to Zilliz Cloud's Volume service.

```python
VolumeManager(
    cloud_endpoint: str,
    api_key: str
)
```

**PARAMETERS:**

- **cloud_endpoint** (*str*) -

    **[REQUIRED]**

    The Zilliz Cloud endpoint, which is `https:*//*api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **api_key** (*str*) -

    **[REQUIRED]**

    Your Zilliz Cloud API key with sufficient permissions to manage volumes on Zilliz Cloud's Volume service. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

**RETURN TYPE:**

`VolumeManager`

**RETURNS:**

A `VolumeManager` instance.

## Examples\{#examples}

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

