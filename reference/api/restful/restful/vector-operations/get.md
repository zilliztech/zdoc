---
displayed_sidebar: restfulSidebar
sidebar_position: 17
slug: /get
title: Get
---

import RestHeader from '@site/src/components/RestHeader';

Gets entities by the specified IDs. You can set an ID in string or integer or set a set of IDs in a list of strings or a list of integers as shown in the four types of request bodies below.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v1/vector/get" />

---

## Example


:::info Notes

You can use either of the following ways to authorize:

- An [API Key](/docs/manage-api-keys) with appropriate permissions.
- A colon-joined username and password of the target cluster. For example, `username:p@ssw0rd`.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::


- Get a specified entity whose ID is an integer.

```shell
curl --request POST \
    --url "${cluster-endpoint}/v1/vector/get" \
    --header "Authorization: Bearer ${YOUR_TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "outputFields": ["id", "title", "link"],
      "id": 1
    }'
```

- Get a specified entity whose ID is a string:

```shell
curl --request POST \
    --url "${cluster-endpoint}/v1/vector/get" \
    --header "Authorization: Bearer ${YOUR_TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "outputFields": ["id", "title", "link"],
      "id": "id1"
    }'
```

- Get a list of entities whose IDs are integers:

```shell
curl --request POST \
    --url "${cluster-endpoint}/v1/vector/get" \
    --header "Authorization: Bearer ${YOUR_TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "outputFields": ["id", "title", "link"],
      "id": [1, 2]
    }'
```

- Get a list of entities whose IDs are strings:

```shell
curl --request POST \
    --url "${cluster-endpoint}/v1/vector/get" \
    --header "Authorization: Bearer ${YOUR_TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d "{
      "collectionName": "medium_articles",
      "outputFields": ["id", "title", "link"],
      "id": ["id1", "id2"]
    }"
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
    "partitionNames": [
        {}
    ],
    "outputFields": [
        {}
    ],
    "id": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `partitionNames`  | **array**<br/>The name of the partitions to which this operation applies.|
| `outputFields`  | **array**<br/>An array of fields to return along with the search results.|
| `id`  | **string**(required)<br/>The ID of the entity to be retrieved|

```json
{
    "dbName": "string",
    "collectionName": "string",
    "outputFields": [
        {}
    ],
    "id": [
        {}
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `outputFields`  | **array**<br/>An array of fields to return along with the search results.|
| `id`  | **array**(required)<br/>An array of IDs of the entities to be retrieved|

```json
{
    "dbName": "string",
    "collectionName": "string",
    "outputFields": [
        {}
    ],
    "id": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `outputFields`  | **array**<br/>An array of fields to return along with the search results.|
| `id`  | **integer**(required)<br/>The ID of entity to be retrieved|

```json
{
    "dbName": "string",
    "collectionName": "string",
    "outputFields": [
        {}
    ],
    "id": [
        {}
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `outputFields`  | **array**<br/>An array of fields to return along with the search results.|
| `id`  | **array**(required)<br/>An array of IDs of the entities to be retrieved|

## Response

Returns the search results.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {}
    ]
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
| `data`  | **array**<br/>A data array of objects. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90002 | The return value property xxx does not exist on collection xxx. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90110 | No filter key field. |
| 90133 | No get content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx |
| 90140 | The number of elements in parameter 'id' should not exceed 100. |

