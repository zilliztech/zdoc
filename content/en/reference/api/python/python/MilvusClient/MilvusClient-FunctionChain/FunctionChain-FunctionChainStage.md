---
title: "FunctionChainStage | Python | MilvusClient"
slug: /python/python/FunctionChain-FunctionChainStage
sidebar_label: "FunctionChainStage"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A FunctionChainStage instance is one execution stage where a function chain can run. | Python | MilvusClient"
type: docx
token: IUVldU03IosKJqxo8W9cU0g5nWh
sidebar_position: 2
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionChainStage
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainStage

A FunctionChainStage instance is one execution stage where a function chain can run.

**VALUES:**

- `UNSPECIFIED`

    The stage is not specified.

- `INGESTION`

    The chain runs during data ingestion.

- `PRE_PROCESS`

    The chain runs before the main query or search process.

- `L0_RERANK`

    The chain runs at the first reranking stage.

- `L1_RERANK`

    The chain runs at the second reranking stage.

- `L2_RERANK`

    The chain runs at the third reranking stage.

- `POST_PROCESS`

    The chain runs after the main query or search process.

## Examples\{#examples}

```python
from pymilvus import FunctionChain, FunctionChainStage

chain = FunctionChain(
    FunctionChainStage.L2_RERANK,
    name="rerank",
)
```
