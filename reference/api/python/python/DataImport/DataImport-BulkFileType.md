---
displayed_sidbar: pythonSidebar
title: "BulkFileType | Python"
slug: /python/python/DataImport-BulkFileType
sidebar_label: "BulkFileType"
beta: false
notebook: false
description: "This is an enumeration that provides the following constants. | Python"
type: docx
token: CROadSmHNoV2CuxREnccTkaen0e
sidebar_position: 1
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - BulkFileType
  - python
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# BulkFileType

This is an enumeration that provides the following constants.

## Constants{#constants}

- **JSON** = 2
Sets the file type to **JSON** (*.json*).

- **PARQUET** = 3
Sets the file type to [Parquet](https://parquet.apache.org/) (*.parquet*).

## Examples{#examples}

```python
from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType

local_writer = LocalBulkWriter(
    schema=schema,
    local_path=Path(OUTPUT_PATH).joinpath('json'),
    chunk_size=4*1024*1024,
    # highlight-next
    file_type=BulkFileType.JSON
)
```
