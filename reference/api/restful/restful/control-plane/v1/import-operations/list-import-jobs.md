---
displayed_sidebar: restfulSidebar
sidebar_position: 17
slug: /restful/list-import-jobs
title: List Import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

List all import jobs specific to a cluster.

<RestHeader method="get" endpoint="https://controller.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import/list" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import/list?clusterId=${CLUSTER_ID}&pageSize=10&currentPage=1" \
--header "Authorization: Bearer ${API_KEY}"
```

Possible return is similar to the following.

```json
{
    "code": 200,
    "data": {
        "tasks": [
            {
                "collectionName": "medium_articles",
                "jobId": "job-xxxxxxxxxxxxxxxxxxxxxx",
                "state": "ImportRunning"
            },
            {
                "collectionName": "medium_articles",
                "jobId": "2b93fef7-xxxx-xxxx-xxxx-f82afd598ff1",
                "state": "ImportCompleted"
            }
        ],
        "count": 2,
        "currentPage": 1,
        "pageSize": 10
    }
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __clusterId__  | **string**(required)<br/>The ID of a specific cluster on Zilliz Cloud.|
    | __pageSize__  | **string**<br/>The number of records to return at each request.|
    | __currentPage__  | **string**<br/>The current page number.|

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns a list of import jobs.

### Response Body

```json
{
    "code": "string",
    "data": {
        "count": "string",
        "currentPage": "string",
        "pageSize": "string",
        "records": [
            {
                "collectionName": "string",
                "jobId": "string",
                "state": "string"
            }
        ]
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.count__ | __string__  <br/>Total number of records listed in this response.  |
| __data.currentPage__ | __string__  <br/>The current page number for your reference.  |
| __data.pageSize__ | __string__  <br/>The maximum number of records to be included in each return.  |
| __data[].records__ | __array__<br/> |
| __data[].records[]__ | __object__<br/> |
| __data[].records[].collectionName__ | __string__  <br/>The target collection name of a import task.  |
| __data[].records[].jobId__ | __string__  <br/>The ID of an import task.  |
| __data[].records[].state__ | __string__  <br/>The corresponding status of the import task. Possible values are <b>ImportRunning</b>, <b>ImportCompleted</b> and <b>ImportFailed</b>.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

