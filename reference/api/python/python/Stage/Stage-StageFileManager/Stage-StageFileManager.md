---
title: "StageFileManager | Python"
slug: /python/python/Stage-StageFileManager
sidebar_label: "StageFileManager"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `StageFileManager` instance maintains a connection to a specific Zilliz Cloud stage. Before uploading data files to a stage, you need to initiate a `StageFileManager` instance. | Python"
type: docx
token: IbWgdAwWOoTa1exF2LicP9henJJ
sidebar_position: 1
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - StageFileManager
  - pymilvus25
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StageFileManager

A `StageFileManager` instance maintains a connection to a specific Zilliz Cloud stage. Before uploading data files to a stage, you need to initiate a `StageFileManager` instance.

```python
class pymilvus.bulk_writer.stage_file_manager.StageFileManager
```

<Admonition type="info" icon="📘" title="Notes">

<p>A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. For details, refer to <a href="/docs/manage-stages">Manage Stages</a>.</p>

</Admonition>

## Constructor{#constructor}

This constructor initializes a new `StageFileManager` instance designed to maintain a connection to a specific Zilliz Cloud stage.

```python
StageFileManager(
    cloud_endpoint: str,
    api_key: str,
    stage_name: str
)
```

**PARAMETERS:**

- **cloud_endpoint** (*str*) -

    **&#91;REQUIRED&#93;**

    The Zilliz Cloud endpoint, which is `https:*//*api.cloud.zilliz.com` (Global) or `https://api.cloud.zilliz.com.cn` (China), depending on the platform you have registered with.

- **api_key** (*str*) -

    **&#91;REQUIRED&#93;**

    Your Zilliz Cloud API key with sufficient permissions to manage stages on Zilliz Cloud's Stage service. To obtain a Zilliz Cloud API key, follow the steps on [API Keys](/docs/manage-api-keys).

- **stage_name** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the target stage of this operation.

**RETURN TYPE:**

`StageFileManager`

**RETURNS:**

A `StageFileManager` instance.

## Examples{#examples}

```python
from pymilvus.bulk_writer.stage_file_manager import StageFileManager

stage_manager = StageFileManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    stage_name="my_stage"
)
```

