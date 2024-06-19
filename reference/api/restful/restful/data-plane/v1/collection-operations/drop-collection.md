---
displayed_sidebar: restfulSidebar
sidebar_position: 22
slug: /restful/drop-collection
title: Drop Collection
---

import RestHeader from '@site/src/components/RestHeader';

Drops a collection. This operation erases your collection data. Exercise caution when performing this operation.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections/drop" />

---

## Example




:::info Notes

You can use either of the following ways to authorize:

- An [API Key](/docs/manage-api-keys) with appropriate permissions.
- A colon-joined username and password of the target cluster. For example, `username:p@ssw0rd`.

:::


```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/collections/drop" \
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

- No header parameters required

### Request Body

```json
{
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to delete.  |

## Response

Returns an empty object.

### Response Body

```json
{
    "code": "integer",
    "data": {}
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |

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

