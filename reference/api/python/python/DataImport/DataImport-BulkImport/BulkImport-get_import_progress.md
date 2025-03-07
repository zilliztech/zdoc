---
displayed_sidbar: pythonSidebar
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
notebook: false
description: "This operation gets the progress of the specified bulk-import job. | Python"
type: docx
token: MkWNdU1tvoqlBRxI05Rcu09cnEc
sidebar_position: 2
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - get_import_progress()
  - pymilvus25
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
displayed_sidebar: pythonSidebar

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

```python
pymilvus.get_import_progress(
    url: str,
    job_id: str,
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
    # {
    #     "code": "integer",
    #     "data": {
    #         "collectionName": "string",
    #         "fileSize": "interger",
    #         "jobId": "string",
    #         "state": "string",
    #         "progress": "integer",
    #         "reason": "string",
    #         "importedRows": "integer",
    #         "totalRows": "integer",
    #         "completeTime": "string",
    #         "details":[
    #             {
    #                 "fileName": "string",
    #                 "fileSize": "integer",
    #                 "state": "string",
    #                 "progress": "integer",
    #                 "reason": "string",
    #                 "importedRows": "integer",
    #                 "totalRows": "integer",
    #                 "completeTime": "string"
    #             },
    #             ...
    #         ]
    #     }
    # }
    ```

- Response structure

    - **collectionName** (*string*) -

        The name of the target collection.

    - **fileSize** (*string*) -

        The size of the currently processed data file in bytes.

    - **jobId** (*string*) -

        The ID of the current bulk-import job of your interests.

    - **state** (*string*) - 

        The current state of this job. Possible values are as follows:

        - **Pending**: The tasks are awaiting scheduling and execution;

        - **Importing**: The tasks are currently being executed;

        - **Completed**: The tasks have been successfully completed;

        - **Failed**: The tasks encountered a failure.

    - **progress** (*int*) -

        The progress of the current operation in floats. 

        The value ranges from `0` to `1`, and stays at `1` when this operation completes.

    - **reason** (*string*) -

        The reason for any errors that occur.

    - **importRows** (*int*) -

        The number of entities already imported. 

    - **totalRows** (*int*) -

        The total number of entities to import. 

    - **completeTime** (*string*) -

        The time at which this operation is completed.

        The time is displayed in the format of `XXXX-XX-XXTXX:XX:XXZ`.

    - **details** (*array*) -

        - **fileName** (*string*) -

            The name of a data file.

        - **fileSize** (*int*) -

            The size of this data file.

        - **state** (*string*) - 

            The current state of importing this file. Possible values are as follows:

            - **Pending**: The tasks are awaiting scheduling and execution;

            - **Importing**: The tasks are currently being executed;

            - **Completed**: The tasks have been successfully completed;

            - **Failed**: The tasks encountered a failure.

        - **progress** (*int*) -

            The bulk-import progress of this data file.

        - **reason** (*string*) -

            The reason for any errors that occur during importing this file.

        - **importRows** (*int*) -

            The number of entities already imported from this file. 

        - **totalRows** (*int*) -

            The total number of entities to import from this file. 

        - **completeTime** (*string*) -

            The time at which this data file has been imported.

**EXCEPTIONS:**

None

## Examples{#examples}

```python
import json
from pymilvus.bulk_writer import get_import_progress

## Zilliz Cloud constants
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# Get bulk-insert job progress
resp = get_import_progress(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID,
    job_id="job-01fa0e5d42cjxudhpuehyp",
)

print(json.dumps(resp.json(), indent=4))

# Output
#
# {
#     "code": 200,
#     "data": {
#         "collectionName": "medium_articles",
#         "fileName": "folder/1/",
#         "fileSize": 26571700,
#         "readyPercentage": 1,
#         "completeTime": "2023-10-28T06:51:49Z",
#         "errorMessage": null,
#         "jobId": "job-01fa0e5d42cjxudhpuehyp",
#         "details": [
#             {
#                 "fileName": "folder/1/",
#                 "fileSize": 26571700,
#                 "readyPercentage": 1,
#                 "completeTime": "2023-10-28T06:51:49Z",
#                 "errorMessage": null
#             }
#         ]
#     }
# }
```

For details, refer to [Import Data (SDK)](/docs/import-data-via-sdks) in our user guides.

## Related methods{#related-methods}

- [bulk_import()](./BulkImport-bulk_import)

- [list_import_jobs()](./BulkImport-list_import_jobs)

