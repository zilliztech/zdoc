---
displayed_sidbar: pythonSidebar
title: "BulkFileType | Python"
slug: /python/python/DataImport-BulkFileType
sidebar_label: "BulkFileType"
added_since: Inherit
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This is an enumeration that provides the following constants. | Python"
type: docx
token: NV3Ud1M9iojhaSxZY4ec8RjgnlP
sidebar_position: 1
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - BulkFileType
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# BulkFileType

This is an enumeration that provides the following constants.

## Constants

- **NPY** = 1

    Sets the file type to **NumPy** (*.npy*).

- **JSON_RB** = 2

    Sets the file type to **JSON** (*.json*).

- **PARQUET** = 3

    Sets the file type to [Parquet](https://parquet.apache.org/) (*.parquet*).

- **CSV** = 4

    Sets the file type to **CSV** (*.csv*).

## Examples

```python
from pymilvus import LocalBulkWriter, BulkFileType

local_writer = LocalBulkWriter(
    schema=schema,
    local_path=Path(OUTPUT_PATH).joinpath('json'),
    segment_size=4*1024*1024,
    # highlight-next
    file_type=BulkFileType.JSON_RB
)
```
