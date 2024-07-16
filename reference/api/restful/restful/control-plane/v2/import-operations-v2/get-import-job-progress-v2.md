---
displayed_sidebar: restfulSidebar
sidebar_position: 54
slug: /restful/get-import-job-progress-v2
title: Get Import Job Progress
---

import RestHeader from '@site/src/components/RestHeader';

This operation gets the progress of the specified bulk-import job.

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/vectordb/jobs/import/get_progress" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/jobs/import/get_progress" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "jobId": 44870776388440916
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": {
        "collectionName": "quick_setup",
        "completeTime": "2024-04-01T06:17:55Z",
        "details": [
            {
                "completeTime": "2024-04-01T06:17:53Z",
                "fileName": "id:448761313698322012 paths:\"a6fb2d1c-7b1b-427c-a8a3-178944e3b66d/1.parquet\" ",
                "fileSize": 3279917,
                "importedRows": 100000,
                "progress": 100,
                "state": "Completed",
                "totalRows": 100000
            }
        ],
        "fileSize": 3279917,
        "importedRows": 100000,
        "jobId": "448761313698322011",
        "progress": 100,
        "state": "Completed",
        "totalRows": 100000
    }
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.
Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "jobId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __jobId__ | __string__  <br/>The ID of the bulk-import job of your interest. <br/>The **Create import Jobs** operation usually returns a job ID. You can also call **List Import Jobs** to get the IDs of all bulk-import jobs related to the specific cluster.  |

## Response

成功

### Response Body

```json
{
    "code": "integer",
    "data": {
        "collectionName": "string",
        "completeTime": "string",
        "details": [
            {
                "completeTime": "string",
                "fileName": "string",
                "fileSize": "string",
                "progress": "string",
                "state": "string",
                "reason": "string",
                "importedRows": "string",
                "totalRows": "string"
            }
        ],
        "fileSize": "integer",
        "jobId": "integer",
        "progress": "integer",
        "state": "string",
        "reason": "string",
        "importedRows": "integer",
        "totalRows": "integer"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.collectionName__ | __string__  <br/>The name of the target collection of this bulk-import job.  |
| __data.completeTime__ | __string__  <br/>The timestamp indicating when the bulk-import job is complete.  |
| __data[].details__ | __array__<br/>Statistics on data import oriented to data files. |
| __data[].details[]__ | __object__<br/>Statistics on data import from a file. |
| __data[].details[].completeTime__ | __string__  <br/>The timestamp at which the file is processed.  |
| __data[].details[].fileName__ | __string__  <br/>The name of a data file.  |
| __data[].details[].fileSize__ | __string__  <br/>The size of the data file.  |
| __data[].details[].progress__ | __string__  <br/>The progress in percentage.  |
| __data[].details[].state__ | __string__  <br/>The processing state of the data file. Possible values are __Pending__, __Importing__, __Completed__, and __Failed__.  |
| __data[].details[].reason__ | __string__  <br/>The reason for the failure to bulk import data.  |
| __data[].details[].importedRows__ | __string__  <br/>The number of rows imported from this file.  |
| __data[].details[].totalRows__ | __string__  <br/>The number of rows in the specified collection upon the import from this file is complete.  |
| __data.fileSize__ | __integer__  <br/>The uploaded file size in bytes.  |
| __data.jobId__ | __integer__  <br/>The ID of this bulk-import job.  |
| __data.progress__ | __integer__  <br/>The progress in percentage of the current bulk-import job.  |
| __data.state__ | __string__  <br/>The state of this bulk-import job. Possible values are __Pending__, __Importing__, __Completed__, and __Failed__.  |
| __data.reason__ | __string__  <br/>The reason for the failure to bulk import data.  |
| __data.importedRows__ | __integer__  <br/>The number of rows inserted into the specified collection upon this import.  |
| __data.totalRows__ | __integer__  <br/>The number of rows in the specified collection.  |

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

