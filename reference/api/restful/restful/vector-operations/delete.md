---
displayed_sidebar: restfulSidebar
sidebar_position: 13
slug: /restful/delete
title: Delete
---

import RestHeader from '@site/src/components/RestHeader';

Deletes one or more entities from a collection.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v1/vector/delete" />

---

## Example


:::info Notes

You can use either of the following ways to authorize:

- An [API Key](/docs/manage-api-keys) with appropriate permissions.
- A colon-joined username and password of the target cluster. For example, `username:p@ssw0rd`.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::


- Delete a collection whose ID is an integer.

```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "id": 1
    }'
```

- Delete a collection whose ID is a string.

```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "id": "id1"
    }'
```

- Delete a list of collections whose IDs are integers.

```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
       "collectionName": "medium_articles",
       "id": [1,2,3,4]
     }'
```

- Delete a list of collections whose IDs are strings.

```shell
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
       "collectionName": "medium_articles",
       "id": ["id1", "id2", "id3","id4"]
     }'
```


## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __id__ | string  <br/>The ID of the entity to be retrieved  |

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __id__ | array<br/>An array of IDs of the entities to be retrieved |
| __id[]__ | string  <br/>  |

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __id__ | integer  <br/>The ID of the entity to be retrieved  |

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __id__ | array<br/>An array of IDs of the entities to be retrieved |
| __id[]__ | integer  <br/>  |

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
| 90110 | No filter key field. |
| 90123 | The inputted ID value does not match the field xxx |
| 90124 | no id key field |
| 90127 | Please use xxx in (a |
| 90128 | Not contains data to filter |
| 90129 | Filter dataType not support |
| 90132 | No delete content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx |
| 90140 | The number of elements in parameter 'id' should not exceed 100. |
