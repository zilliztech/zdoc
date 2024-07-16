---
displayed_sidebar: restfulSidebar
sidebar_position: 6
slug: /restful/delete
title: Delete
---

import RestHeader from '@site/src/components/RestHeader';

Deletes one or more entities from a collection.

<include target="zilliz">
import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
You can use eitehr of the following ways to authorize:
<ul>
<li> An API Key with appropriate permissions.</li>
<li>A colon-joined username and password of the target cluster. For example, `username:passowrd`.</li>
</ul>
    
</Admonition>
</include>

```shell
<include target="milvus">
export MILVUS_URI="http://localhost:19530"
export TOKEN="username:password"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
</include>
<include target="zilliz">
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530"
export TOKEN="db_admin:xxxxxxxxxxx"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
</include>
    --header "Authorization: Bearer ${TOKEN}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
      "collectionName": "medium_articles",
      "id": 1
    }'
```

Possible response is similar to the following.

```json
{
    "code": 200,
    "data": {}
}
```

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/delete" />

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

- No header parameters required

### Request Body

#### Option 1: 

```json
{
    "collectionName": "string",
    "id": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __id__ | __string__  <br/>The ID of the entity to be retrieved  |

#### Option 2: 

```json
{
    "collectionName": "string",
    "id": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __id__ | __array__<br/>An array of IDs of the entities to be retrieved |
| __id[]__ | __string__  <br/>  |

#### Option 3: 

```json
{
    "collectionName": "string",
    "id": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __id__ | __integer__  <br/>The ID of the entity to be retrieved  |

#### Option 4: 

```json
{
    "collectionName": "string",
    "id": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __id__ | __array__<br/>An array of IDs of the entities to be retrieved |
| __id[]__ | __integer__  <br/>  |

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

