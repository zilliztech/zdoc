---
displayed_sidebar: restfulSidebar
sidebar_position: 13
slug: /restful/list-import-jobs
title: List Import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

List all import jobs specific to a cluster.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/vector/collections/import/list" />

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
    | `clusterId`  | **string**(required)<br/>The ID of a specific cluster on Zilliz Cloud.|
    | `pageSize`  | **string**<br/>The number of records to return at each request.|
    | `currentPage`  | **string**<br/>The current page number.|

- No path parameters required

### Request Body

No request body required

## Response

Returns a list of import jobs.

### Response Bodies

- Response body if we process your request successfully

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

- Response body if we failed to process your request

```json
{
    "code": integer,
    "message": string
}
```

### Properties

The properties in the returned response are listed in the following table.

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `code`   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __code__ | string  <br/>  |
| __data__ | object<br/> |
| __data.count__ | string  <br/>Total number of records listed in this response.  |
| __data.currentPage__ | string  <br/>The current page number for your reference.  |
| __data.pageSize__ | string  <br/>The maximum number of records to be included in each return.  |
| __data[].records__ | array<br/> |
| __data[].records[]__ | object<br/> |
| __data[].records[].collectionName__ | string  <br/>The target collection name of a import task.  |
| __data[].records[].jobId__ | string  <br/>The ID of an import task.  |
| __data[].records[].state__ | string  <br/>The corresponding status of the import task. Possible values are <b>ImportRunning</b>, <b>ImportCompleted</b> and <b>ImportFailed</b>.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
