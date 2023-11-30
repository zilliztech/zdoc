---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /import
title: Import
---

import RestHeader from '@site/src/components/RestHeader';

Imports data from files stored in a specified object storage bucket. Note that the bucket should be in the same cloud as the target cluster of the import.

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/vector/collections/import" />

---

## Example


Imports data from files stored in a specified object storage bucket. Note that the bucket should be in the same cloud as the target cluster of the import.

```shell
curl --request POST \
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "clusterId": "in03-181766e3f9556b7",
       "collectionName": "medium_articles",
       "objectUrl": "gs://publicdataset-zillizcloud-com/medium_articles_2020.json"
       "accessKey": "your-access-key"
       "secretKey": "your-secret-key"
     }'
```


## Request

### Parameters

- No query parameters required

- No path parameters required

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
| `clusterId`  | **string**(required)<br/>The ID of a cluster to which this operation applies.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `partitionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `objectUrl`  | **string**(required)<br/>The URL of the object that stores the data to be imported.|
| `accessKey`  | **string**<br/>The access key used to access the specified object.|
| `secretKey`  | **string**<br/>The access secret key used to access the specified object.|

## Response

Returns a import task job ID.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "jobId": "string"
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
| `data.jobId`   | **string**<br/>The ID of the import task that has been submitted |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10003 | Invalid s3 ObjectUrl. [xxx] |
| 40003 | Action not available given the current status of the cluster. |
| 40021 | The cluster ID does not exist. |
| 40022 | No access to this cluster. Please request access from your admin. |
| 47005 | The specified cluster collection not exists. |
| 47005 | The specified cluster collection not exists. |
| 47035 | The specified object size exceeds limit. |
| 47036 | The number of objects not equal to the number of collection fields. |
| 47039 | The specified cluster do not support multiple imports at the same time. |
| 47053 | Failed to checkFiles {xxx}. |
| 47055 | The current cluster is currently importing data (xxx). To ensure more stable service of your Milvus cluster |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 83001 | Failed to getObjectMeta {xxx}. |
| 83001 | Failed to getObjectMeta {xxx}. |
| 83004 | Importing files across clouds is not currently supported |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90104 | The clusterId parameter is empty in the request parameter. |
| 90117 | "Invalid domain name used |
| 90142 | No import content provided. |
| 90145 | No ObjectUrl key field. |

