---
displayed_sidbar: pythonSidebar
slug: /python/BulkImport-get_import_progress
beta: false
notebook: false
token: MkWNdU1tvoqlBRxI05Rcu09cnEc
sidebar_position: 3
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

- **job_id** (*string*) -

    **[REQUIRED]**

    The ID of the bulk-import job of your interest. 

    The **bulk_import()** operation usually returns a job ID. You can also call **list-import-jobs()** to get the IDs of all bulk-import jobs related to the specific cluster.

- **cluster_id** (*string*) -

    **[REQUIRED]**

    The instance ID of the target cluster of this operation.

    You can get the instance ID of a cluster on its details page from the Zilliz Cloud console.

**RETURN TYPE:**

*dict*

**RETURNS:**

- Response syntax

    ```python
    *# {*
    *#     "code": 200,*
    *#     "data": {*
    *#         "collectionName": "string",*
    *#         "fileName": "string",*
    *#         "fileSize": int,*
    *#         "readyPercentage": int,*
    *#         "completeTime": "string",*
    *#         "errorMessage": null,*
    *#         "jobId": "string",*
    *#         "details": [*
    *#             {*
    *#                 "fileName": "string",*
    *#                 "fileSize": int,*
    *#                 "readyPercentage": int,*
    *#                 "completeTime": "string",*
    *#                 "errorMessage": null*
    *#             }*
    *#         ]*
    *#     }*
    *# }*
    ```

- Response structure

    - **collectionName** (*string*) -

        The name of the target collection.

    - **fileName** (*string*) -

        The name of the currently processed data file.

    - **fileSize** (*string*) -

        The size of the currently processed data file in bytes.

    - **readyPercentage** (*int*) -

        The progress of the current operation in floats. 

        The value ranges from `0` to `1`, and stays at `1` when this operation completes.

    - **completeTime** (*string*) -

        The time at which this operation is completed.

        The time is displayed in the format of `XXXX-XX-XXTXX:XX:XXZ`.

    - **errorMessage** (*string* / *null*) -

        An error message explaining any errors during this operation. It should always be **null** if no error occurs.

    - **jobId** (*string*) -

        The ID of the current bulk-import job of your interests.

    - **details** (*array*) -

        - **fileName** (*string*) -

            The name of a data file.

        - **fileSize** (*int*) -

            The size of this data file.

        - **readyPercentage** (*int*) -

            The bulk-import progress of this data file.

        - **completeTime** (*string*) -

            The time at which this data file has been imported.

        - **errorMessage** (*string* / *null*) - 

            An error message explaining any errors during this data file has been uploaded. It should always be **null** if no error occurs.

**EXCEPTIONS:**

None

## Examples{#examples}

```python

```
