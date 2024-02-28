---
displayed_sidbar: pythonSidebar
slug: /python/BulkImport-list_import_jobs
beta: false
notebook: false
type: docx
token: P0vxdEVBPoTNKLxkKIzcznlYnNc
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# list_import_jobs()

This operation lists all bulk-import jobs of a specific cluster.

## Request syntax{#request-syntax}

```python
list_import_jobs(
    url: str,
    api_key: str,
    cluster_id: str,
    page_size: int,
    current_page: int,
    **kwargs,
) -> requests.Response
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

    Possible values are:

    - A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster, or

    - A pair of username and password of the target cluster joined by a colon(:).

- __cluster_id__ (_string_) -

    __[REQUIRED]__

    The instance ID of the target cluster of this operation.

    You can get the instance ID of a cluster on its details page from the Zilliz Cloud console.

- __page_size__ (_int_) -

    __[REQUIRED]__

    The maximum number of bulk-import jobs returned per call.

- __current_page__ (_int_) -

    __[REQUIRED]__

    The specific page in the returned list of bulk-import jobs. 

    You can use this to offset certain records in combination with `page_size`.

__RETURN TYPE:__

_dict_

__RETURNS:__

- Response syntax

    ```python
    # {
    #     "code": 200,
    #     "data": {
    #         "tasks": [
    #             {
    #                 "collectionName": "medium_articles",
    #                 "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
    #                 "state": "ImportCompleted"
    #             }
    #         ],
    #         "count": 1,
    #         "currentPage": 1,
    #         "pageSize": 10
    #     }
    # }
    ```

- Response structure

    - __tasks__ (_array_)

        - __collectionName__ (_string_)

            The name of the target collection of this bulk-import job.

        - __jobId__ (_string_)

            The ID of this bulk-import job.

        - __state__ (_string_)

            The state of this bulk-import job.

            Possible values are __Importing__ and __ImportCompleted__.

    - __count__ (_int_)

        The number of bulk-import jobs in the tasks list.

    - __currentPage__ (_int_)

        The maximum number of records in the tasks list.

    - __pageSize__ (_int_)  

        The current page of the tasks list.

__EXCEPTIONS:__

None

## Examples{#examples}

```python
from pymilvus import list_import_jobs

res = list_import_jobs(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    cluster_id=CLUSTER_ID,
    page_size=10,
    current_page=1,
)

print(res.json())

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

## Related methods{#related-methods}

- [bulk_import()](./BulkImport-bulk_import)

- [get_import_progress()](./BulkImport-get_import_progress)

