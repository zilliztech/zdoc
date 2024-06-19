---
displayed_sidebar: restfulSidebar
sidebar_position: 12
slug: /restful/get-import-progress
title: Get Import Progress
---

import RestHeader from '@site/src/components/RestHeader';

Retrieves the progress of a specified import task.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import/get" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import/get?jobId=${JOBID}&clusterId=${CLUSTERID}" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```




## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __jobId__  | **string**(required)<br/>The ID of the import task in concern|
    | __clusterId__  | **string**(required)<br/>The ID of a cluster to which this operation applies.|

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns the progress of the specified job ID in percentage.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "fileName": "string",
        "fileSize": "integer",
        "readyPercentage": "number",
        "completeTime": "string",
        "errorMessage": "string",
        "collectionName": "string",
        "jobId": "string",
        "details": [
            {
                "fileName": "string",
                "fileSize": "integer",
                "readyPercentage": "number",
                "completeTime": "string",
                "errorMessage": "string"
            }
        ]
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.fileName__ | __string__  <br/>The path of the data file object in the object storage.  |
| __data.fileSize__ | __integer__ (int64) <br/>The size of the data file object.  |
| __data.readyPercentage__ | __number__ (float) <br/>The indicator of the import progress  |
| __data.completeTime__ | __string__  <br/>The time at which the import task completes. `null` indicates that the file import is going on.  |
| __data.errorMessage__ | __string__  <br/>The message that explains the reason for an import failure. `null` indicates that no error occurs.  |
| __data.collectionName__ | __string__  <br/>The target collection name of the import task.  |
| __data.jobId__ | __string__  <br/>The ID of an import task.  |
| __data[].details__ | __array__<br/>The import task details |
| __data[].details[]__ | __object__<br/> |
| __data[].details[].fileName__ | __string__  <br/>The path to a file being imported.  |
| __data[].details[].fileSize__ | __integer__ (int64) <br/>The size of a file being imported.  |
| __data[].details[].readyPercentage__ | __number__ (float) <br/>The import progress of a specific file.  |
| __data[].details[].completeTime__ | __string__  <br/>The time at which the import progress ends for a specific file. `null` indicates that the file import is going on.  |
| __data[].details[].errorMessage__ | __string__  <br/>The message that explains the reason for an import failure. `null` indicates that no error occurs.  |

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

