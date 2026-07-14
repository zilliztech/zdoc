---
title: "BulkFileType | Python"
slug: /python/python/DataImport-BulkFileType
sidebar_label: "BulkFileType"
beta: false
added_since: Inherit
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Python"
type: docx
token: NV3Ud1M9iojhaSxZY4ec8RjgnlP
sidebar_position: 1
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - BulkFileType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BulkFileType

以下の定数を提供する列挙型です。

## 定数\{#constants}

- **NPY** = 1

    ファイルタイプを **NumPy** (*.npy*) に設定します。

- **JSON** = 2

    ファイルタイプを **JSON** (*.json*) に設定します。 

- **PARQUET** = 3

    ファイルタイプを [Parquet](https://parquet.apache.org/) (*.parquet*) に設定します。

- **CSV** = 4

    ファイルタイプを **CSV** (*.csv*) に設定します。

## 例\{#examples}

```python
from pymilvus import LocalBulkWriter, BulkFileType

local_writer = LocalBulkWriter(
    schema=schema,
    local_path=Path(OUTPUT_PATH).joinpath('json'),
    segment_size=4*1024*1024,
    # highlight-next
    file_type=BulkFileType.PARQUET
)
```
