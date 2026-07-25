---
displayed_sidbar: pythonSidebar
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
added_since: Inherit
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all bulk-import jobs of a specific cluster. | Python"
type: docx
token: P0vxdEVBPoTNKLxkKIzcznlYnNc
sidebar_position: 3
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - list_import_jobs()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_import_jobs()

This operation lists all bulk-import jobs of a specific cluster.

## Request syntax

```python
list_import_jobs(
    url: str,
    api_key: str,
    cluster_id: str,
) -> requests.Response
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

    Possible values are:

    - A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster, or

    - A pair of username and password of the target cluster joined by a colon(:).

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
    #     "code": 0,
    #     "data": {
    #         "records": [
    #             {
    #                 "collectionName": "quick_setup",
    #                 "jobId": "453240863839750922",
    #                 "progress": 100,
    #                 "state": "Completed"
    #             }
    #         ]
    #     }
    # }
    ```

- Response structure

    - **records** (*list*) -

        The list of import jobs.

        - **collectionName** (*string*) -

            The name of the target collection of this bulk-import job.

        - **jobId** (*string*) -

            The ID of this bulk-import job.

        - **progress** (*string*) - 

            The progress of the job.

        - **state** (*string*) -

            The state of this bulk-import job. Possible values are as follows:

            - **Pending**: The tasks are awaiting scheduling and execution;

            - **Importing**: The tasks are currently being executed;

            - **Completed**: The tasks have been successfully completed;

            - **Failed**: The tasks encountered a failure.

**EXCEPTIONS:**

None

## Examples

```python
import json
from pymilvus.bulk_writer import list_import_jobs

## Zilliz Cloud constants
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# List bulk-insert jobs
resp = list_import_jobs(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID
)

print(json.dumps(resp.json(), indent=4))

# Output
#
# {
#     "code": 200,
#     "data": {
#         "tasks": [
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "53632e6c-c078-4476-b840-10c4793d9c08",
#                 "state": "ImportCompleted"
#             },
#         ],
#         "count": 2,
#         "currentPage": 1,
#         "pageSize": 10
#     }
# }
```

For details, refer to [Import Data (SDK)](/docs/import-data-via-sdks) in our user guides.

## Related methods

- [bulk_import()](./BulkImport-bulk_import)

- [get_import_progress()](./BulkImport-get_import_progress)

