---
title: "optimize() | Python | MilvusClient"
slug: /python/python/Management-optimize
sidebar_key: python/Management-optimize
sidebar_label: "optimize()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "- isl0 (bool) - | Python | MilvusClient"
type: docx
token: MhRidjHwYorxaexS8WXcaxWQnjd
sidebar_position: 24
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - optimize()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# optimize()

- **is_l0** (*bool*) -

    Whether to run L0 compaction.

- **target_size** (*int*) -

    Target segment size after compaction. Must be a positive integer. If omitted, the server default is used.

- **target_size_unit** (*str*) -

    Unit for `target_size`. Supported values are `"b"`, `"kb"`, `"mb"`, `"gb"`, `"tb"`, and `"pb"`. The client converts this value to MB before sending the request.

This operation compacts small segments in a collection and returns a compaction job ID that you can poll for progress.

<Admonition type="danger" icon="🚧" title="Warning">

This is a Preview version feature for non-production use only (Benchmark, POC).

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

This method applies only to dedicated serving clusters and on-demand compute. 

- For this operation in a collection of a serving cluster, please create **[MilvusClient](./Client-MilvusClient)** with the cluster endpoint.

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- For this operation in a collection for on-demand compute, create **[MilvusClient](./Client-MilvusClient)** with the project endpoints, and then create a session to attach to an on-demand cluster for searches.

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.optimize(
    collection_name: str,
    is_clustering: bool = False,
    is_l0: bool = False,
    target_size: int | None = None,
    target_size_unit: str = "mb",
    wait: bool = True,
    timeout: float | None = None,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection to optimize.

- **is_clustering** (*bool*) -

    Target segment size. Format: `"1000MB"`, `"1GB"`, `"1.2gb"`. If not provided, uses the system default.

- **wait** (*bool*) -

    Whether to wait for optimization to complete. Defaults to **True**. If **False**, returns an `OptimizeTask` for async tracking.

- **timeout** (*float*) -

    Maximum time in seconds to wait for optimization. Only applies when `wait=True`.

**RETURN TYPE:**
*OptimizeResult | OptimizeTask*

Returns an `OptimizeResult` when `wait=True`, or an `OptimizeTask` when `wait=False`.

**RETURNS:**

When `wait=True`, returns an **OptimizeResult** with status, collection_name, compaction_id, target_size, and progress. When `wait=False`, returns an **OptimizeTask** supporting `done()`, `progress()`, `result()`, and `cancel()`.

**EXCEPTIONS:**

- **ParamError**

    This exception will be raised when `collection_name` is invalid or `target_size` format is incorrect.

- **MilvusException**

    This exception will be raised when index build fails, compaction fails, or timeout occurs.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Wait for completion
result = client.optimize(
    collection_name="book",
    target_size=512,
    target_size_unit="mb",
    wait=True,
)
print(result)

# Run asynchronously
task = client.optimize(
    collection_name="book",
    is_clustering=True,
    target_size=1,
    target_size_unit="gb",
    wait=False,
)
print(task.job_id)
```
