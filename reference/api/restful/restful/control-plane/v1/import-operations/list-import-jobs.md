---
displayed_sidebar: restfulSidebar
sidebar_position: 13
slug: /restful/list-import-jobs
title: List Import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

List all import jobs specific to a cluster.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import/list" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import/list?clusterId=${CLUSTERID}" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

