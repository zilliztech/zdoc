---
title: "refresh_external_collection() | Python | MilvusClient"
slug: /python/python/Collections-refresh_external_collection
sidebar_label: "refresh_external_collection()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation scans the data files in the schema-defined external storage and generates metadata files that record their mapping relationship to those data files. | Python | MilvusClient"
type: docx
token: ZVs4dDpvmoXI0OxOnKhc9numnJd
sidebar_position: 29
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - refresh_external_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_external_collection()

This operation scans the data files in the schema-defined external storage and generates metadata files that record their mapping relationship to those data files.

<Admonition type="info" icon="📘" title="Notes">

This requires a MilvusClient set up using the project endpoint as follows:

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
refresh_external_collection(
    collection_name: str,
    external_source: str = "",
    external_spec: str = "",
    timeout: Optional[float] = None,
    **kwargs,    
) -> int
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing external collection.

- **external_source** (*str*) -

    The external source URI, which should be a `volume://` URI that points to an accessible external volume. For example, `volume://<volume-name>/path/to/folder/`..

- **external_spec** (*str*) -

    The external source specifications, which are a set of secondary parameters:

    - **format** (*str*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

    - **snapshot_id** (*str*) -

        The ID of an Iceberg table. This applies only when `format` is `iceberg-table`.

- **timeout** (*float*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation times out when any response arrives or any error occurs.

**RETURN TYPE:**

*int*

**RETURNS:**

An integer that indicates an asynchronous job that has been created.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_PROJECT_ENDPOINT",
    token="YOUR_API_KEY"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        return job_id
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        return job_id

    time.sleep(2)
```

