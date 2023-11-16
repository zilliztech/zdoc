---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /list-import-jobs
title: List Import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

List all import jobs specific to a cluster.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/vector/collections/import/list" />

---

## Example


List all import jobs specific to a cluster.

```shell
curl --request GET \
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import/list?clusterId=${CLUSTERID}" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
```

## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `clusterId`  | **string**(required)<br/>The ID of a specific cluster on Zilliz Cloud.|
    | `pageSize`  | **string**<br/>The number of records to return at each request.|
    | `currentPage`  | **string**<br/>The current page number.|

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**(required)<br/>|

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
| `data`    | **object**<br/>A data object. |
| `data.count`   | **string**<br/>Total number of records listed in this response. |
| `data.currentPage`   | **string**<br/>The current page number for your reference. |
| `data.pageSize`   | **string**<br/>The maximum number of records to be included in each return. |
| `data.records`   | **array**<br/> |
| `data.records[].collectionName`   | **string**<br/>The target collection name of a import task. |
| `data.records[].jobId`   | **string**<br/>The ID of an import task. |
| `data.records[].state`   | **string**<br/>The corresponding status of the import task. Possible values are <b>ImportRunning</b>, <b>ImportCompleted</b> and <b>ImportFailed</b>. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 40021 | The cluster ID does not exist. |
| 40022 | No access to this cluster. Please request access from your admin. |
| 80000 | Incorrect parameter: xxx |
| 80003 | The parameter value for 'pageSize' should be between 5 and 100. |
| 80004 | The parameter 'currentPage' should have a value between 1 and the maximum value of Int. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 90102 | The cluster does not exist in current region. |
| 90104 | The clusterId parameter is empty in the request parameter. |
| 90117 | "Invalid domain name used |

