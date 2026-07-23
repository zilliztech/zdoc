---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "Adds projectid and regionid filtering. | Python"
type: docx
token: N13hd7jVjoA6B1xlgwic2GKRn5f
sidebar_position: 3
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - list_import_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_import_jobs()

Adds project_id and region_id filtering.

## Request Syntax\{#request-syntax}

```python
list_import_jobs(
    url: str,
    collection_name: str = "",
    db_name: str = "",
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    page_size: int = 10,
    current_page: int = 1,
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**PARAMETERS:**

- **url** (*str*) -<br/>
  **[REQUIRED]**

    The Zilliz Cloud API server endpoint, which is `https://api.cloud.zilliz.com`.

- **collection_name** (*str*) -<br/>
  Default: `""`<br/>
  The name of the collection whose import jobs are listed.

- **db_name** (*str*) -<br/>
  Default: `""`<br/>
  The name of the database whose import jobs are listed.

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

- **page_size** (*int*) -<br/>
  Default: `10`<br/>
  The maximum number of import jobs to return per page.

- **current_page** (*int*) -<br/>
  Default: `1`<br/>
  The one-based page number to return.

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

HTTP response containing the matching import jobs and pagination information.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example lists import jobs from Zilliz Cloud.

```python
from pymilvus.bulk_writer import list_import_jobs

response = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
)
print(response.json())
```
