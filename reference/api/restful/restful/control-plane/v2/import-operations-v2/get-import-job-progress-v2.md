---
displayed_sidebar: restfulSidebar
sidebar_position: 39
slug: /restful/get-import-job-progress-v2
title: Get Import Job Progress
---

import RestHeader from '@site/src/components/RestHeader';

Retrieves the progress of a specified import job.

import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/vectordb/jobs/import/getProgress" />

---

## Example



```shell
export API_KEY=""

curl --location --request POST "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/getProgress" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
--data-raw '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "jobId": 44870776388440916
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": {
        "jobId": "448761313698322011",
        "collectionName": "medium_articles",
        "fileName":"medium_articles_2020_dpr.json",
        "fileSize": 3279917,
        "state": "Completed",
        "progress": 100,
        "completeTime": "2024-04-01T06:17:55Z",
        "reason":"",
        "totalRows": 100000,
        "details": [
            {
                "fileName": "medium_articles_2020_dpr.json",
                "fileSize": 3279917,
                "state": "Completed",
                "progress": 100,
                "completeTime": "2024-04-01T06:17:53Z",
                "reason":""
            }
        ]
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
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|

### Request Body

```json
{
    "jobId": "string",
    "clusterId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __jobId__ | __string__  <br/>The ID of the import job in concern  |
| __clusterId__ | __string__  <br/>The ID of a cluster to which this operation applies.  |

## Response

Returns the progress of a specified import job.

### Response Body

```json
{
    "code": "string",
    "data": {
        "jobId": "string",
        "collectionName": "string",
        "fileName": "string",
        "fileSize": "integer",
        "state": "string",
        "progress": "integer",
        "completeTime": "string",
        "reason": "string",
        "totalRows": "integer",
        "details": [
            {
                "fileName": "string",
                "fileSize": "integer",
                "state": "string",
                "progress": "integer",
                "completeTime": "string",
                "reason": "string"
            }
        ]
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/>Response payload. |
| __data.jobId__ | __string__  <br/>ID of an import job.  |
| __data.collectionName__ | __string__  <br/>Target collection name of the import job.  |
| __data.fileName__ | __string__  <br/>Path of the data file object in the object storage.  |
| __data.fileSize__ | __integer__  <br/>Size of the data file object.  |
| __data.state__ | __string__  <br/>State of this import job. Possible values are Pending, Importing, Completed, and Failed.  |
| __data.progress__ | __integer__  <br/>Progress in percentage of the current import job.  |
| __data.completeTime__ | __string__  <br/>Timestamp indicating when the import job is complete.  |
| __data.reason__ | __string__  <br/>Reason for the failure to import data.  |
| __data.totalRows__ | __integer__  <br/>Number of rows in the specified collection.  |
| __data[].details__ | __array__<br/>Statistics on data import oriented to data files. |
| __data[].details[]__ | __object__<br/> |
| __data[].details[].fileName__ | __string__  <br/>The name of a data file.  |
| __data[].details[].fileSize__ | __integer__  <br/>The size of the data file.  |
| __data[].details[].state__ | __string__  <br/>The processing state of the data file. Possible values are Pending, Importing, Completed, and Failed.  |
| __data[].details[].progress__ | __integer__  <br/>The progress in percentage.  |
| __data[].details[].completeTime__ | __string__  <br/>The timestamp at which the file is processed.  |
| __data[].details[].reason__ | __string__  <br/>The reason for the failure to import data.  |

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

