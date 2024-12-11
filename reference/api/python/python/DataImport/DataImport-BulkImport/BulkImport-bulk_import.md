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

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of a collection in the target cluster of this operation.

- **files** (*list*) -

    **[REQUIRED]**

    The list of string lists, each string list contains a singular row-based file path or multiple column-based file paths.

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
from pymilvus import bulk_import

CLOUD_REGION = ""    # Cloud region ID of the target Zilliz Cloud cluster
API_KEY = ""         # A Zilliz Cloud API Key with sufficient permissions
OBJECT_URL = ""      # URL of the data file to import in a remote bucket
ACCESS_KEY = ""      # Access key used to access the remote bucket
SECRET_KEY = ""      # Secure keys used to access the remote bucket
CLUSTER_ID = ""      # ID of the Zilliz Cloud target cluster
COLLECTION_NAME = "" # Name of the target collection in the specified Zilliz Cloud cluster

res = bulk_import(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    object_url=OBJECT_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    cluster_id=CLUSTER_ID,
    collection_name=COLLECTION_NAME
)

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "jobId": "job-01fa0e5d42cjxudhpuehyp"
#     }
# }
```

For details, refer to [Import Data (SDK)](/docs/import-data-via-sdks) in our user guides.

<include  target="milvus">

```python
from pymilvus.bulk_writer import bulk_import

url = f"http://localhost:19530"

# Bulk-insert data from a set of JSON files already uploaded to the MinIO server
resp = bulk_import(
    url=url,
    collection_name="quick_setup",
    files=[['a1e18323-a658-4d1b-95a7-9907a4391bcf/1.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/2.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/3.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/4.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/5.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/6.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/7.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/8.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/9.parquet'],
           ['a1e18323-a658-4d1b-95a7-9907a4391bcf/10.parquet']],
)

job_id = resp.json()['data']['jobId']
print(job_id)

# {
#     "code": 200,
#     "data": {
#         "jobId": "453240863839750922"
#     }
# }
```

</include>

## Related methods{#related-methods}

- [get_import_progress()](./BulkImport-get_import_progress)

- [list_import_jobs()](./BulkImport-list_import_jobs)

