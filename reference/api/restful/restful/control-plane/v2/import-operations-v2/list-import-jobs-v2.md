---
displayed_sidebar: restfulSidebar
sidebar_position: 32
slug: /restful/list-import-jobs-v2
title: List Import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists all import jobs of a specific cluster.

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/vectordb/jobs/import/list" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --location --request POST "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/list" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
--data-raw '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "currentPage":1,
    "pageSize":10,
}'
```
Possible response is similart to the following.
```json
{
    "code": 0,
    "data": {
        "count":1000,
        "currentPage":1,
        "pageSize":10,
        "records": [
            {
                "collectionName": "quick_setup",
                "jobId": "448761313698322011",
                "state": "Importing"
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
    "clusterId": "string",
    "pageSize": "integer",
    "currentPage": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __clusterId__ | __string__  <br/>ID of a specific cluster on Zilliz Cloud.  |
| __pageSize__ | __integer__  <br/>Number of records to return at each request.  |
| __currentPage__ | __integer__  <br/>Current page number.  |

## Response

成功

### Response Body

```json
{
    "code": "string",
    "data": {
        "count": "integer",
        "currentPage": "integer",
        "pageSize": "integer",
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
| __data__ | __object__<br/>Response payload. |
| __data.count__ | __integer__  <br/>Total number of records listed in this response.  |
| __data.currentPage__ | __integer__  <br/>Current page number for your reference.  |
| __data.pageSize__ | __integer__  <br/>Maximum number of records to be included in each return.  |
| __data[].records__ | __array__<br/>List of import jobs in detail. |
| __data[].records[]__ | __object__<br/>An import job in detail. |
| __data[].records[].collectionName__ | __string__  <br/>Name of the target collection of this import job.  |
| __data[].records[].jobId__ | __string__  <br/>ID of this import job.  |
| __data[].records[].state__ | __string__  <br/>State of this import job. Possible values are Pending, InProgress, Completed, and Failed.  |

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

