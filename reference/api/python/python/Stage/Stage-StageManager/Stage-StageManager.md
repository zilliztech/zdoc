---
displayed_sidbar: pythonSidebar
title: "StageManager | Python"
slug: /python/python/Stage-StageManager
sidebar_label: "StageManager"
beta: false
notebook: false
description: "A `StageManager` instance maintains a connection to Zilliz Cloud's Stage service. Before creating, listing, or deleting stages, you need to initiate a `StageManager` instance. | Python"
type: docx
token: XdZ6dFzA3oUu4dxWh7Kcz4dhnQg
sidebar_position: 4
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - StageManager
  - pymilvus25
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# StageManager

A `StageManager` instance maintains a connection to Zilliz Cloud's Stage service. Before creating, listing, or deleting stages, you need to initiate a `StageManager` instance.

```python
class pymilvus.bulk_writer.stage_manager.StageManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/manage-stages">Manage Stages</a>.</p>

</Admonition>

## Constructor{#constructor}

This constructor initializes a new `StageManager` instance designed to maintain a connection to Zilliz Cloud's Stage service.

```python
StageManager(
    cloud_endpoint: str,
    api_key: str
)
```

**PARAMETERS:**

- **cloud_endpoint** (*str*) -

    **&#91;REQUIRED&#93;**

    The Zilliz Cloud endpoint, which is `https:*//*api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **api_key** (*str*) -

    **&#91;REQUIRED&#93;**

    Your Zilliz Cloud API key with sufficient permissions to manage stages on Zilliz Cloud's Stage service. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

**RETURN TYPE:**

`StageManager`

**RETURNS:**

A `StageManager` instance.

## Examples{#examples}

```python
from pymilvus.bulk_writer.stage_manager import StageManager

stage_manager = StageManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

