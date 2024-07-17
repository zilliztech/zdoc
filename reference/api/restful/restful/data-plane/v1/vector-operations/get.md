---
displayed_sidebar: restfulSidebar
sidebar_position: 76
slug: /restful/get
title: Get
---

import RestHeader from '@site/src/components/RestHeader';

Gets entities by the specified IDs. You can set an ID in string or integer or set a set of IDs in a list of strings or a list of integers as shown in the four types of request bodies below.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/get" />

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
    --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
    --header "Authorization: Bearer ${TOKEN}" \
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
    --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
    --header "Authorization: Bearer ${TOKEN}" \
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
    --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
    --header "Authorization: Bearer ${TOKEN}" \
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
    --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
    --header "Authorization: Bearer ${TOKEN}" \
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

- No header parameters required

### Request Body

#### Option 1: 

```json
{
    "collectionName": "string",
    "outputFields": [],
    "id": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>  |
| __id__ | __string__  <br/>The ID of the entity to be retrieved  |

#### Option 2: 

```json
{
    "collectionName": "string",
    "outputFields": [],
    "id": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>  |
| __id__ | __array__<br/>An array of IDs of the entities to be retrieved |
| __id[]__ | __string__  <br/>An ID represents an entity.  |

#### Option 3: 

```json
{
    "collectionName": "string",
    "outputFields": [],
    "id": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>  |
| __id__ | __integer__  <br/>The ID of entity to be retrieved  |

#### Option 4: 

```json
{
    "collectionName": "string",
    "outputFields": [],
    "id": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>  |
| __id__ | __array__<br/>An array of IDs of the entities to be retrieved |
| __id[]__ | __integer__  <br/>  |

## Response

Returns the search results.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {}
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

