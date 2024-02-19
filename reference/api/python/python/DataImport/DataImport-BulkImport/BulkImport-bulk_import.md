---
displayed_sidbar: pythonSidebar
slug: /python/BulkImport-bulk_import
beta: false
notebook: false
token: S9dyd4UwhoqOPux411KcbafDnde
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# bulk_import()

This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read [Prepare Data Import](./use-bulkwriter-for-data-import).

```python
pymilvus.bulk_import(
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

The following operations are related to `bulk_import()`:

- get_import_progress()

- list_import_jobs()

- LocalBulkWriter

- RemoteBulkWriter

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import bulk_import

response = bulk_import(
    url='string',
    api_key='string',
    object_url='string',
    access_key='string',
    secret_key='string',
    cluster_id='string',
    collection_name='string'
)
```

**PARAMETERS:**

- **url** (*string*) -

    **[REQUIRED]**

    The endpoint URL of your Zilliz Cloud cluster. 

    For example, the endpoint URL should be in the following format:

    ```python
    controller.api.${cloud-region}.zillizcloud.com[:${port-number}] 
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

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of a collection in the target cluster of this operation.

**RETURN TYPE:**

*dict*

**RETURNS:**

- Response syntax

    ```python
    *# {*
    *#     "code": 200,*
    *#     "data": {*
    *#         "jobId": "string"*
    *#     }*
    *# }*
    ```

- Response structure

    - **jobId** (*string*) -

        If present, indicates that a bulk-import job has been created successfully and is currently running.

**EXCEPTIONS:**

None

## Examples{#examples}

```python

```

