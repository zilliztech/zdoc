---
displayed_sidbar: pythonSidebar
slug: /python/BulkImport-get_import_progress
beta: false
notebook: false
token: MkWNdU1tvoqlBRxI05Rcu09cnEc
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# get_import_progress()

This operation gets the progress of the specified bulk-import job.

```python
pymilvus.get_import_progress(
    url: str,
    api_key: str,
    job_id: str,
    cluster_id: str,
)
```

The following operations are related to `get_import_progress()`:

- bulk-import()

- list-import-jobs()

- LocalBulkWriter

- RemoteBulkWriter

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import get_import_progress

response = get_import_progress(
    url='string',
    api_key='string',
    job_id='string',
    cluster_id='string',
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
    _# {_
    _#     "code": 200,_
    _#     "data": {_
    _#         "collectionName": "string",_
    _#         "fileName": "string",_
    _#         "fileSize": int,_
    _#         "readyPercentage": int,_
    _#         "completeTime": "string",_
    _#         "errorMessage": null,_
    _#         "jobId": "string",_
    _#         "details": [_
    _#             {_
    _#                 "fileName": "string",_
    _#                 "fileSize": int,_
    _#                 "readyPercentage": int,_
    _#                 "completeTime": "string",_
    _#                 "errorMessage": null_
    _#             }_
    _#         ]_
    _#     }_
    _# }_
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

```
