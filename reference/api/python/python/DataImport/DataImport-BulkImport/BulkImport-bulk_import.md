---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_key: python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This function submits a bulk import job for open-source Milvus or Zilliz Cloud, including project/region routing for project databases. | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - bulk_import()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# bulk_import()

This function submits a bulk import job for open-source Milvus or Zilliz Cloud, including project/region routing for project databases.

## Request Syntax\{#request-syntax}

```python
bulk_import(
    url: str,
    collection_name: str,
    db_name: str = "",
    files: list[list[str]] | None = None,
    object_url: str = "",
    object_urls: list[list[str]] | None = None,
    cluster_id: str = "",
    api_key: str = "",
    access_key: str = "",
    secret_key: str = "",
    token: str = "",
    volume_name: str = "",
    data_paths: list[list[str]] | None = None,
    
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

    Server endpoint for Milvus or Zilliz Cloud bulk import APIs.

- **collection_name** (*str*) -

    **[REQUIRED]**

    Target collection name.

- **db_name** (*str*) -

    Target database name.

- **files** (*list[list[str]]*) -

    Local file groups for import.

- **object_url** (*str*) -

    An object storage URL for cloud import.

- **object_urls** (*list[list[str]]*) -

    Object storage URL groups for cloud import.

- **cluster_id** (*str*) -

    Cloud cluster ID for import jobs.

- **access_key** (*str*) -

    Object storage access key.

- **secret_key** (*str*) -

    Object storage secret key.

- **token** (*str*) -

    Temporary session token for object storage access.

- **volume_name** (*str*) -

    Volume name for volume-based imports.

- **data_paths** (*list[list[str]]*) -

    Volume-relative paths for data files.

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

- **kwargs** (*dict*) -

    Optional fields such as `partition_name` and `options`.

**RETURN TYPE:**
*requests.Response*

Returns the import-job creation response.

HTTP response containing created import job metadata.

**EXCEPTIONS:**

- **MilvusException**

    Raised when request submission fails or the server rejects the job.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import bulk_import

resp = bulk_import(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    collection_name="book_catalog",
    files=[
        ["s3://demo-bucket/books/part-0001.parquet"],
        ["s3://demo-bucket/books/part-0002.parquet"],
    ],
    access_key="AKIA...",
    secret_key="SECRET...",
)

print(resp.json())
```

<include  target="milvus">

```python
from pymilvus.bulk_writer import bulk_import

resp = bulk_import(
    url="https://YOUR_CLUSTER_ENDPOINT",
    api_key="username:password", # replace this with your actual credentials
    collection_name="book_catalog",
    files=[
        ["s3://demo-bucket/books/part-0001.parquet"],
        ["s3://demo-bucket/books/part-0002.parquet"],
    ],
    access_key="AKIA...",
    secret_key="SECRET...",
)

print(resp.json())
```

</include>