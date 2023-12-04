---
displayed_sidebar: referenceSidebar
sidebar_position: 16
slug: /get-import-progress
title: Get Import Progress
---

import RestHeader from '@site/src/components/RestHeader';

Retrieves the progress of a specified import task.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/vector/collections/import/get" />

---

## Example


Retrieves the progress of a specified import task.

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import/get?jobId=${JOBID}&clusterId=${CLUSTERID}" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
```


## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `jobId`  | **string**(required)<br/>The ID of the import task in concern|
    | `clusterId`  | **string**(required)<br/>The ID of a cluster to which this operation applies.|

- No path parameters required

### Request Body

No request body required

## Response

Returns the progress of the specified job ID in percentage.

### Response Bodies

- Response body if we process your request successfully

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
| `data`    | **object**<br/>A data object. |
| `data.fileName`   | **string**<br/>The path of the data file object in the object storage. |
| `data.fileSize`   | **integer(int64)**<br/>The size of the data file object. |
| `data.readyPercentage`   | **number(float)**<br/>The indicator of the import progress |
| `data.completeTime`   | **string**<br/>The time at which the import task completes. `null` indicates that the file import is going on. |
| `data.errorMessage`   | **string**<br/>The message that explains the reason for an import failure. `null` indicates that no error occurs. |
| `data.collectionName`   | **string**<br/>The target collection name of the import task. |
| `data.jobId`   | **string**<br/>The ID of an import task. |
| `data.details`   | **array**<br/>The import task details |
| `data.details[].fileName`   | **string**<br/>The path to a file being imported. |
| `data.details[].fileSize`   | **integer(int64)**<br/>The size of a file being imported. |
| `data.details[].readyPercentage`   | **number(float)**<br/>The import progress of a specific file. |
| `data.details[].completeTime`   | **string**<br/>The time at which the import progress ends for a specific file. `null` indicates that the file import is going on. |
| `data.details[].errorMessage`   | **string**<br/>The message that explains the reason for an import failure. `null` indicates that no error occurs. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 40021 | The cluster ID does not exist. |
| 40022 | No access to this cluster. Please request access from your admin. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 90102 | The cluster does not exist in current region. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90104 | The clusterId parameter is empty in the request parameter. |
| 90117 | "Invalid domain name used |
| 90144 | No jobId record found under this cluster |

