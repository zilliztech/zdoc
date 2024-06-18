---
displayed_sidebar: restfulSidebar
sidebar_position: 20
slug: /restful/create-collection
title: Create Collection
---

import RestHeader from '@site/src/components/RestHeader';

Creates a collection in a cluster.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections/create" />

---

## Example




:::info Notes

You can use either of the following ways to authorize:

- An [API Key](/docs/manage-api-keys) with appropriate permissions.
- A colon-joined username and password of the target cluster. For example, `username:p@ssw0rd`.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::

```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{ 
      "collectionName": "medium_articles",
      "dimension": 256,
      "metricType": "L2",
      "primaryField": "id",
      "vectorField": "vector"
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
    "collectionName": "string",
    "dimension": "integer",
    "metricType": "string",
    "primaryField": "string",
    "vectorField": "string",
    "description": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | string  <br/>The name of the collection to create.  |
| __dimension__ | integer  <br/>The number of dimensions for the vector field of the collection. For performance-optimized CUs, this value ranges from 1 to 32768. For capacity-optimized and cost-optimized CUs, this value ranges from 32 to 32768.<br/>The value ranges from 1 to 32768.  |
| __metricType__ | string  <br/>The distance metric used for the collection.<br/>The value defaults to L2  |
| __primaryField__ | string  <br/>The primary key field.<br/>The value defaults to id  |
| __vectorField__ | string  <br/>The vector field.<br/>The value defaults to vector  |
| __description__ | string  <br/>The description of the collection  |

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
| __code__ | integer  <br/>  |
| __data__ | object<br/> |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
