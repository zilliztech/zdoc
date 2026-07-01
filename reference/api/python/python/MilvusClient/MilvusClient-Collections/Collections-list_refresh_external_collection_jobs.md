---
title: "list_refresh_external_collection_jobs() | Python | MilvusClient"
slug: /python/python/Collections-list_refresh_external_collection_jobs
sidebar_key: python/Collections-list_refresh_external_collection_jobs
sidebar_label: "list_refresh_external_collection_jobs()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: PUBLIC
notebook: false
description: "This operation lists the external collection refresh jobs of all or specified collections. | Python | MilvusClient"
type: docx
token: VkBFdLHwao9hVMxzRurcBYIynFh
sidebar_position: 28
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - list_refresh_external_collection_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_refresh_external_collection_jobs()

This operation lists the external collection refresh jobs of all or specified collections.

<Admonition type="info" icon="📘" title="Notes">

This requires a MilvusClient set up using the project endpoint as follows:

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
def list_refresh_external_collection_jobs(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> List:
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of the target collection. If this parameter is left unspecified, the refresh jobs of all external collections are turned.

- **timeout** (*float*) - 

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation times out when any response arrives or any error occurs.

**RETURN TYPE:**

*List*

**RETURNS:**

A list of **RefreshExternalCollectionJobInfo** objects, each recording the details of the an external collection refresh job.

**PARAMETERS:**

- **job_id** (*int*) -

    The job ID specified in the current request.

- **collection_name** (*string*) -

    The name of the external collection specified in `refresh_external_collection()`.

- **state** (*string*) -

    The current state of the specified job. Possible values are:

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** (*int*) -

    The current progress of the specified job. The value is an integer ranging from 0 to 100.

- **external_source** (*str*) -

    The external source URI specified in `refresh_external_collection()`.

- **external_specs** (*str*) -

    The external specs specified in `refresh_external_collection()`.

- **reason** (*str*) -

    The error prompt if the refresh operation failed. It is an empty string in normal cases.

- **start_time** (*int*) -

    The timestamp in milliseconds at which the specified job starts.

- **end_time** (*int*) -  

    The timestamp in milliseconds at which the specified job ends.

## Example\{#example}

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

