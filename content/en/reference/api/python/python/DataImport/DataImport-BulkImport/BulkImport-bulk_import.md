---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This function submits a bulk import job for open-source Milvus or Zilliz Cloud. | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - bulk_import()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# bulk_import()

This function submits a bulk import job for open-source Milvus or Zilliz Cloud.

## Request Syntax\{#request-syntax}

```python
bulk_import(
    url: str,
    collection_name: str,
    db_name: str = "",
    object_url: str = "",
    object_urls: Optional[List[List[str]]] = None,
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    access_key: str = "",
    secret_key: str = "",
    token: str = "",
    volume_name: str = "",
    data_paths: Optional[List[List[str]]] = None,
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
  **[REQUIRED]**<br/>
  The name of the target collection.

- **db_name** (*str*) -<br/>
  Default: `""`<br/>
  The name of the target database.

- **object_url** (*str*) -<br/>
  Default: `""`<br/>
  The deprecated object-storage URL. Use `object_urls` for new Zilliz Cloud integrations.

- **object_urls** (*Optional[List[List[str]]]*) -<br/>
  Default: `None`<br/>
  The object-storage URLs containing the import data. Each nested list identifies one object or folder.

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

- **access_key** (*str*) -<br/>
  Default: `""`<br/>
  The access key for the object-storage credentials used by Zilliz Cloud.

- **secret_key** (*str*) -<br/>
  Default: `""`<br/>
  The secret key for the object-storage credentials used by Zilliz Cloud.

- **token** (*str*) -<br/>
  Default: `""`<br/>
  The session token for temporary object-storage credentials used by Zilliz Cloud.

- **volume_name** (*str*) -<br/>
  Default: `""`<br/>
  The name of the Zilliz Cloud volume containing the import data.

- **data_paths** (*Optional[List[List[str]]]*) -<br/>
  Default: `None`<br/>
  The paths within the Zilliz Cloud volume that contain the import data.

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

HTTP response returned by the bulk-import endpoint. Inspect the JSON payload for the submitted job identifier.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example submits object-storage data to Zilliz Cloud.

```python
from pymilvus.bulk_writer import bulk_import

response = bulk_import(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
    collection_name="book_chunks",
    object_urls=[["s3://bucket/books/part-0001.parquet"]],
)
print(response.json())
```
