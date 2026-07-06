---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "- This function returns the current status of a bulk import job. | Python"
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

- This function returns the current status of a bulk import job.

    Region ID for project-database import jobs.

Request Syntax

## get_import_progress(
    url: str,
    job_id: str,
    cluster_id: str = "",
    api_key: str = "",
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)\{#getimportprogress-url-str-jobid-str-clusterid-str-apikey-str-verify-bool}

```python
PARAMETERS:
```

**url** (*str*) -

- **job_id** (*str*) -

    **[REQUIRED]**

    Server endpoint for bulk import APIs.

- **cluster_id** (*str*) -

    **[REQUIRED]**

    Import job ID returned by `bulk_import()`.

- **api_key** (*str*) -

    Cloud cluster ID.

- **verify** (*bool | str*) -

    API key for cloud authentication.

- **cert** (*str | tuple*) -

    Database name for request routing.

- **RETURN TYPE:**
*requests.Response*

    TLS verification setting.

- Returns the current import-job progress payload.

    Client certificate path or `(cert, key)` tuple.

- Examples

    Additional HTTP request options.

from pymilvus.bulk_writer import get_import_progress

resp = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    cluster_id="in0x-xxx",
    job_id="448996221577371648",
)

print(resp.json())

Returns the current import-job progress payload.

HTTP response with import job progress details.

**EXCEPTIONS:**

- **MilvusException**

    Raised when progress lookup fails.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import get_import_progress

resp = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    cluster_id="in0x-xxx",
    job_id="448996221577371648",
)

print(resp.json())
```
