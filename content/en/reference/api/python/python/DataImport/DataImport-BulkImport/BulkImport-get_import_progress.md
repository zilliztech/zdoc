---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "Adds projectid, regionid, dbname, and DB-Name header behavior. | Python"
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

Adds project_id, region_id, db_name, and DB-Name header behavior.

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
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**PARAMETERS:**

- **url** (*str*) -<br/>
  **[REQUIRED]**

    The Zilliz Cloud API server endpoint, which is `https://api.cloud.zilliz.com`.

- **job_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The ID of the import job to inspect.

- **cluster_id** (*str*) -<br/>
  Default: `""`<br/>
  The ID of the target Zilliz Cloud cluster.

- **project_id** (*str*) -<br/>
  Default: `""`<br/>
  The ID of the Zilliz Cloud project containing the target project database.

- **region_id** (*str*) -<br/>
  Default: `""`<br/>
  The ID of the Zilliz Cloud region containing the target project database.

- **api_key** (*str*) -<br/>
  Default: `""`

    The Zilliz Cloud API key used to authenticate the request.

- **db_name** (*str*) -<br/>
  Default: `""`<br/>
  The database name sent in the `DB-Name` header for role-based access control.

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  Default: `True`<br/>
  The TLS verification setting. Use `True` to verify with the default trust store or provide a CA certificate path.

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  Default: `None`<br/>
  The client certificate path, or a certificate and private-key pair for mutual TLS.

- **kwargs** (*Any*) -<br/>
  The additional options forwarded to the HTTP request.

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

HTTP response containing the current bulk-import job state and progress.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example retrieves import progress from Zilliz Cloud.

```python
from pymilvus.bulk_writer import get_import_progress

response = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
    job_id="job-123",
)
print(response.json())
```
