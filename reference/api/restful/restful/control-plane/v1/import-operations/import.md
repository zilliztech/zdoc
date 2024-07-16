---
displayed_sidebar: restfulSidebar
sidebar_position: 2
slug: /restful/import
title: Import
---

import RestHeader from '@site/src/components/RestHeader';

Imports data from files stored in a specified object storage bucket.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections/import" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""
export ACCESS_KEY=""
export SECRET_KEY=""

curl --location --request POST "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import" \
--header "Authorization: Bearer ${API_KEY}" \
--data-raw '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "collectionName": "medium_articles",
    "objectUrl": "gs://docs-demo/1af78216-xxxx-xxxx-xxxx-2b0a73c566ed/1.parquet",
    "accessKey": "${ACCESS_KEY}",
    "secretKey": "${SECRET_KEY}"
}'
```

Possible return is similar to the following.

```json
{
    "code": 200,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxxx"
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
    | __Authorization__  | **string**<br/>|

### Request Body

```json
{
    "clusterId": "string",
    "collectionName": "string",
    "objectUrl": "string",
    "accessKey": "string",
    "secretKey": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __clusterId__ | __string__  <br/>The ID of a cluster to which this operation applies.  |
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __objectUrl__ | __string__  <br/>The URL of the object that stores the data to be imported.  |
| __accessKey__ | __string__  <br/>The access key used to access the specified object.  |
| __secretKey__ | __string__  <br/>The access secret key used to access the specified object.  |

## Response

Returns a import task job ID.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "jobId": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.jobId__ | __string__  <br/>The ID of the import task that has been submitted  |

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

