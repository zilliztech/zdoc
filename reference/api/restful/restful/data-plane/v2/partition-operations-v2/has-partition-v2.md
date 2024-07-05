---
displayed_sidebar: restfulSidebar
sidebar_position: 60
slug: /restful/has-partition-v2
title: Has Partition
---

import RestHeader from '@site/src/components/RestHeader';

This operation checks whether a partition exists.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/partitions/has" />

---

import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

This API is not generally available yet, and is subject to change.

</Admonition>

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "https://${CLUSTER_ENDPOINT}/v2/vectordb/partitions/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "partitionName": "january",
    "collectionName": "test_collection"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {
        "has": true
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
    "dbName": "string",
    "collectionName": "string",
    "partitionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of an existing database. The value defaults to __default__.  |
| __collectionName__ | __string__  <br/>The name of an existing collection.  |
| __partitionName__ | __string__  <br/>The name of the partition to test.  |

## Response

A boolean value indicating whether the specified partition exists.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "has": "boolean"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.has__ | __boolean__  <br/>A boolean value indicates whether the specified partition exists.  |

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

