---
displayed_sidbar: pythonSidebar
slug: /python/BulkImport-get_import_progress
beta: false
notebook: false
type: docx
token: MkWNdU1tvoqlBRxI05Rcu09cnEc
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# get_import_progress()

This operation gets the progress of the specified bulk-import job.

## Request syntax{#request-syntax}

```python
pymilvus.get_import_progress(
    url: str,
    api_key: str,
    job_id: str,
    cluster_id: str,
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

- __job_id__ (_string_) -

    __[REQUIRED]__

    The ID of the bulk-import job of your interest. 

    The __bulk_import()__ operation usually returns a job ID. You can also call __list-import-jobs()__ to get the IDs of all bulk-import jobs related to the specific cluster.

- __cluster_id__ (_string_) -

    __[REQUIRED]__

    The instance ID of the target cluster of this operation.

    You can get the instance ID of a cluster on its details page from the Zilliz Cloud console.

__RETURN TYPE:__

_dict_

__RETURNS:__

- Response syntax

    ```python
    # {
    #     "code": 200,
    #     "data": {
    #         "collectionName": "string",
    #         "fileName": "string",
    #         "fileSize": int,
    #         "readyPercentage": int,
    #         "completeTime": "string",
    #         "errorMessage": null,
    #         "jobId": "string",
    #         "details": [
    #             {
    #                 "fileName": "string",
    #                 "fileSize": int,
    #                 "readyPercentage": int,
    #                 "completeTime": "string",
    #                 "errorMessage": null
    #             }
    #         ]
    #     }
    # }
    ```

- Response structure

    - __collectionName__ (_string_) -

        The name of the target collection.

    - __fileName__ (_string_) -

        The name of the currently processed data file.

    - __fileSize__ (_string_) -

        The size of the currently processed data file in bytes.

    - __readyPercentage__ (_int_) -

        The progress of the current operation in floats. 

        The value ranges from `0` to `1`, and stays at `1` when this operation completes.

    - __completeTime__ (_string_) -

        The time at which this operation is completed.

        The time is displayed in the format of `XXXX-XX-XXTXX:XX:XXZ`.

    - __errorMessage__ (_string_ / _null_) -

        An error message explaining any errors during this operation. It should always be __null__ if no error occurs.

    - __jobId__ (_string_) -

        The ID of the current bulk-import job of your interests.

    - __details__ (_array_) -

        - __fileName__ (_string_) -

            The name of a data file.

        - __fileSize__ (_int_) -

            The size of this data file.

        - __readyPercentage__ (_int_) -

            The bulk-import progress of this data file.

        - __completeTime__ (_string_) -

            The time at which this data file has been imported.

        - __errorMessage__ (_string_ / _null_) - 

            An error message explaining any errors during this data file has been uploaded. It should always be __null__ if no error occurs.

__EXCEPTIONS:__

None

## Examples{#examples}

```python
from pymilvus import bulk_import, get_import_progress

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

job_id = res.json()['data']['jobId']
res = get_import_progress(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    job_id=job_id,
    cluster_id=CLUSTER_ID
)

_# Output_
_#_
_# {_
_#     "code": 200,_
_#     "data": {_
_#         "collectionName": "medium_articles",_
_#         "fileName": "folder/1/",_
_#         "fileSize": 26571700,_
_#         "readyPercentage": 1,_
_#         "completeTime": "2023-10-28T06:51:49Z",_
_#         "errorMessage": null,_
_#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",_
_#         "details": [_
_#             {_
_#                 "fileName": "folder/1/",_
_#                 "fileSize": 26571700,_
_#                 "readyPercentage": 1,_
_#                 "completeTime": "2023-10-28T06:51:49Z",_
_#                 "errorMessage": null_
_#             }_
_#         ]_
_#     }_
_# }_
```

For details, refer to [Import Data (SDK)](/docs/import-data-via-sdks) in our user guides.

## Related methods{#related-methods}

- [bulk_import()](./BulkImport-bulk_import)

- [list_import_jobs()](./BulkImport-list_import_jobs)

