---
displayed_sidebar: restfulSidebar
sidebar_position: 3
slug: /restful/create-import-jobs-v2
title: Create Import Jobs
---

import RestHeader from '@site/src/components/RestHeader';

Imports data from files stored in a specified object storage bucket. To learn how to prepare your data files, read [Prepare Data Import](/docs/prepare-source-data).

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --location --request POST "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
--data-raw '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "collectionName": "medium_articles",
    "partitionName":"",
    "objectUrl": "https://s3.us-west-2.amazonaws.com/publicdataset.zillizcloud.com/medium_articles_2020_dpr/medium_articles_2020_dpr.json",
    "accessKey": "",
    "secretKey": ""
}'
```

Possible response is similar to the following

```json
{
    "code": 0,
    "data": {
        "jobId": "448707763884413158"
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
    "collectionName": "string",
    "partitionName": "string",
    "objectUrl": "string",
    "accessKey": "string",
    "secretKey": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __clusterId__ | __string__  <br/>ID of a cluster to which this operation applies.  |
| __collectionName__ | __string__  <br/>Name of the target collection.Setting this to a non-existing collection results in an error.  |
| __partitionName__ | __string__  <br/>Name of the partition to which this operation applies.  |
| __objectUrl__ | __string__  <br/>URL of the object that stores the data to be imported.  |
| __accessKey__ | __string__  <br/>Access key used to access the specified object.  |
| __secretKey__ | __string__  <br/>Access secret key used to access the specified object.  |

## Response

成功

### Response Body

```json
{
    "code": "string",
    "data": {
        "jobId": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/>Response payload. |
| __data.jobId__ | __string__  <br/>ID of the import job that has been submitted.  |

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

