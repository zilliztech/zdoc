---
displayed_sidbar: pythonSidebar
slug: /python/python/DataImport-BulkFileType
beta: FALSE
notebook: FALSE
type: docx
token: CROadSmHNoV2CuxREnccTkaen0e
sidebar_position: 1
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# BulkFileType

This is an enumeration that provides the following constants.

## Constants{#constants}

- **NPY** = 1
Sets the file type to **NumPy** (*.npy*).

- **JSON_RB** = 2
Sets the file type to **JSON** (*.json*).

- **PARQUET** = 3
Sets the file type to [Parquet](https://parquet.apache.org/) (*.parquet*).

## Examples{#examples}

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
