---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This function returns the current status of a bulk import job, including project/region scoped jobs for cloud project databases. | Python"
type: docx
token: CNQIdgQvXoux0KxpXHxca8EMnjg
sidebar_position: 2
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - get_import_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_import_progress()

This function returns the current status of a bulk import job, including project/region scoped jobs for cloud project databases.

## Request Syntax\{#request-syntax}

```python
get_import_progress(
    url: str,
    job_id: str,
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    db_name: str = "",
    
    project_id: str = "",
    region_id: str = "",
    
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)
```

**PARAMETERS:**

- **url** (*str*) -

    **[REQUIRED]**

    Server endpoint for bulk import APIs.

- **job_id** (*str*) -

    **[REQUIRED]**

    Import job ID returned by `bulk_import()`.

- **cluster_id** (*str*) -

    Cloud cluster ID.

- **api_key** (*str*) -

    API key for cloud authentication.

- **db_name** (*str*) -

    Database name for request routing.

- **project_id** (*str*) -

    A valid Zilliz Cloud project ID. 

    This applies when you bulk import into a database for on-demand compute.

- **region_id** (*str*) -

    A valid Zilliz Cloud region ID.

    This applies when you bulk import into a database for on-demand compute.

- **verify** (*bool | str*) -

    TLS verification setting.

- **cert** (*str | tuple*) -

    Client certificate path or `(cert, key)` tuple.

- **project_id** (*str*) -

    Additional HTTP request options.

**RETURN TYPE:**
*requests.Response*

Returns the current import-job progress payload.

**EXCEPTIONS:**

- **MilvusException**

    Raised when progress lookup fails.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import get_import_progress

resp = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    job_id="448996221577371648",
    db_name="book_db",
)

print(resp.json())
```

