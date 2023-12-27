---
displayed_sidebar: referenceSidebar
sidebar_position: 12
slug: /drop-collection
title: Drop Collection
---

import RestHeader from '@site/src/components/RestHeader';

Drops a collection. This operation erases your collection data. Exercise caution when performing this operation.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v1/vector/collections/drop" />

---

## Example


Drop a collection named `medium_articles`.

```shell
curl --request POST \
    --url "${cluster-endpoint}/v1/vector/collections/drop" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
       "collectionName": "medium_articles"
     }'
```

Success response:

```shell
{
    "code": 200,
    "data": {}
}
```


## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to delete.|

## Response

Returns an empty object.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {}
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
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 80022 | Dedicated cluster not support this operation. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90138 | No drop collection content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx |

