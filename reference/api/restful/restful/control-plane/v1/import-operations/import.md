---
displayed_sidebar: restfulSidebar
sidebar_position: 11
slug: /restful/import
title: Import
---

import RestHeader from '@site/src/components/RestHeader';

Imports data from files stored in a specified object storage bucket. Note that the bucket should be in the same cloud as the target cluster of the import.

<RestHeader method="post" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request POST \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/vector/collections/import" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "clusterId": "inxx-xxxxxxxxxxxxxxx",
      "collectionName": "medium_articles",
      "partitionName": "_default",
      "objectUrl": "gs://publicdataset-zillizcloud-com/medium_articles_2020.json",
      "accessKey": "your-access-key",
      "secretKey": "your-secret-key"
    }'
```

Your access key and secret key should have necessary permissions to access the object URL. 

- For AWS S3, the following permissions are required:

  - `s3:GetObject`
  - `s3:ListBucket`
  - `s3:GetBucketLocation`

- For Google Cloud Storage, the following permissions are required:

  - `storage.objects.get`
  - `storage.objects.list`




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

