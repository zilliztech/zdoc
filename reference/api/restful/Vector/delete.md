---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /delete
title: Delete
---

import RestHeader from '@site/src/components/RestHeader';

Deletes one or more entities from a collection.

<RestHeader method="post" endpoint="https://{cluster_endpoint}/v1/vector/delete" />

---

## Example

# RESTful API Examples


## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `public-endpoint`  | **string**(required)<br/>|

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
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `id`  | **string**(required)<br/>The ID of the entity to be retrieved|

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": [
        {}
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `id`  | **array**(required)<br/>An array of IDs of the entities to be retrieved|

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `id`  | **integer**(required)<br/>The ID of the entity to be retrieved|

```json
{
    "dbName": "string",
    "collectionName": "string",
    "id": [
        {}
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `id`  | **array**(required)<br/>An array of IDs of the entities to be retrieved|

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
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80022 | Dedicated cluster not support this operation. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90110 | No filter key field. |
| 90123 | "The inputted ID value does not match the field xxx |
| 90124 | "no id key field |
| 90127 | "Please use xxx in (a |
| 90128 | "Not contains data to filter |
| 90129 | "Filter dataType not support |
| 90132 | No delete content provided. |
| 90139 | "Type mismatch for field 'xxx'. expected type:xxx |
| 90140 | The number of elements in parameter 'id' should not exceed 100. |

