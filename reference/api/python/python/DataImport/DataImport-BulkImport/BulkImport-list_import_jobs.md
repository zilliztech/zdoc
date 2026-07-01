---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_key: python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This function lists bulk import jobs with optional collection and pagination filters, including project/region filters for project databases. | Python"
type: docx
token: N13hd7jVjoA6B1xlgwic2GKRn5f
sidebar_position: 3
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - list_import_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_import_jobs()

This function lists bulk import jobs with optional collection and pagination filters, including project/region filters for project databases.

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

- **collection_name** (*str*) -

    Optional collection filter.

- **db_name** (*str*) -

    Optional database filter.

- **cluster_id** (*str*) -

    Cloud cluster ID.

- **api_key** (*str*) -

    API key for cloud authentication.

- **page_size** (*int*) -

    Number of jobs returned per page.

- **current_page** (*int*) -

    Page number to query.

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

Returns the paginated list of import jobs.

HTTP response containing paged import job summaries.

**EXCEPTIONS:**

- **MilvusException**

    Raised when listing jobs fails.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import list_import_jobs

resp = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    collection_name="book_catalog",
    page_size=20,
    current_page=1,
)

print(resp.json())
```

