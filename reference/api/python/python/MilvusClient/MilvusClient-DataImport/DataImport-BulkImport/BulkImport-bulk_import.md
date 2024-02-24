---
displayed_sidbar: pythonSidebar
slug: /python/BulkImport-bulk_import
beta: false
notebook: false
token: S9dyd4UwhoqOPux411KcbafDnde
sidebar_position: 1
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

__PARAMETERS:__

- __url__ (_string_) -

    __[REQUIRED]__

    The endpoint URL of your Zilliz Cloud cluster. 

    For example, the endpoint URL should be in the following format:

    ```python
    controller.api.${cloud-region}.zillizcloud.com[:${port-number}] 
    ```

    Replace `cloud-region` with the ID of the region that accommodates your cluster. You can get the cloud region ID from the endpoint URL of your cluster.

- __api_key__ (_string_) -

    __[REQUIRED]__

    A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.

- __object_url__ (_string_) -

    __[REQUIRED]__

    The URL of your data files in one of your block storage buckets. The following are some examples of some renowned block storage services:

    ```python
    # Google Cloud Storage
    gs://{bucket-name}/{object-path}/
    
    # AWS S3
    s3://{bucket-name}/{object-path}/
    ```

- __access_key__ (_string_) -

    __[REQUIRED]__

    The access key that is used to authenticate access to your data files.

- __secret_key__ (_string_) -

    __[REQUIRED]__

    The secret key that is used to authenticate access to your data files.

- __cluster_id__ (_string_) -

    __[REQUIRED]__

    The instance ID of the target cluster of this operation.

    You can get the instance ID of a cluster on its details page from the Zilliz Cloud console.

- __collection_name__ (_string_) -

    __[REQUIRED]__

    The name of a collection in the target cluster of this operation.

__RETURN TYPE:__

_dict_

__RETURNS:__

- Response syntax

    ```python
    _# {_
    _#     "code": 200,_
    _#     "data": {_
    _#         "jobId": "string"_
    _#     }_
    _# }_
    ```

- Response structure

    - __jobId__ (_string_) -

        If present, indicates that a bulk-import job has been created successfully and is currently running.

__EXCEPTIONS:__

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

_# Output_
_#_
_# {_
_#     "code": 200,_
_#     "data": {_
_#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a"_
_#     }_
_# }_
```

For details, refer to [Import Data (SDK)](/docs/import-data-via-sdks) in our user guides.

## Related methods{#related-methods}

- [get_import_progress()](./BulkImport-get_import_progress)

- [list_import_jobs()](./BulkImport-list_import_jobs)

