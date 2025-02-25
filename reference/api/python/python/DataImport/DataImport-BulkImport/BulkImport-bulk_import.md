---
displayed_sidbar: pythonSidebar
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
notebook: false
description: "This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read Prepare Data Import. | Python"
type: docx
token: S9dyd4UwhoqOPux411KcbafDnde
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - bulk_import()
  - pymilvus25
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# bulk_import()

This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read [Prepare Data Import](/docs/prepare-data-import).

## Request syntax{#request-syntax}

```python
bulk_import(
    url: str,
    api_key: str,
    object_url: str,
    access_key: str,
    secret_key: str,
    cluster_id: str,
    collection_name: str,
    **kwargs,
)
```

**PARAMETERS:**

- **url** (*string*) -

    **[REQUIRED]**

    The endpoint URL of your Zilliz Cloud cluster. 

    For example, the endpoint URL should be in the following format:

    ```python
    https://api.cloud.zilliz.com
    # https://api.cloud.zilliz.com.cn 
    ```

    Replace `cloud-region` with the ID of the region that accommodates your cluster. You can get the cloud region ID from the endpoint URL of your cluster.

- **api_key** (*string*) -

    **[REQUIRED]**

    A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.

- **object_url** (*string*) -

    **[REQUIRED]**

    The URL of your data files in one of your block storage buckets. The following are some examples of some renowned block storage services:

    ```python
    # Google Cloud Storage
    gs://{bucket-name}/{object-path}/
    
    # AWS S3
    s3://{bucket-name}/{object-path}/
    ```

- **access_key** (*string*) -

    **[REQUIRED]**

    The access key that is used to authenticate access to your data files.

- **secret_key** (*string*) -

    **[REQUIRED]**

    The secret key that is used to authenticate access to your data files.

- **cluster_id** (*string*) -

    **[REQUIRED]**

    The instance ID of the target cluster of this operation.

    You can get the instance ID of a cluster on its details page from the Zilliz Cloud console.

**RETURN TYPE:**

*dict*

**RETURNS:**

- Response syntax

    ```python
    # {
    #     "code": 200,
    #     "data": {
    #         "jobId": "string"
    #     }
    # }
    ```

- Response structure

    - **jobId** (*string*) -

        If present, indicates that a bulk-import job has been created successfully and is currently running.

**EXCEPTIONS:**

None

## Examples{#examples}

```python
from pymilvus.bulk_writer import bulk_import

# Bulk-import your data from the prepared data files
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""
STORAGE_URL = ""
ACCESS_KEY = ""
SECRET_KEY = ""

res = bulk_import(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID,
    collection_name="quick_setup",
    object_url=STORAGE_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY
)

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a"
#     }
# }
```

For details, refer to [Import Data (SDK)](/docs/import-data-via-sdks) in our user guides.

## Related methods{#related-methods}

- [get_import_progress()](./BulkImport-get_import_progress)

- [list_import_jobs()](./BulkImport-list_import_jobs)

