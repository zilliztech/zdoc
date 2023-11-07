---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /search
title: Search
---

import RestHeader from '@site/src/components/RestHeader';

Conducts a similarity search in a collection. 

<RestHeader method="post" endpoint="https://{cluster_endpoint}/v1/vector/search" />

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
    "filter": "string",
    "limit": "integer",
    "offset": "integer",
    "outputFields": [
        {}
    ],
    "vector": [
        {}
    ],
    "params": {
        "radius": "number",
        "range_filter": "number"
    }
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>The name of the database.|
| `collectionName`  | **string**(required)<br/>The name of the collection to which this operation applies.|
| `filter`  | **string**<br/>The filter used to find matches for the search|
| `limit`  | **integer**<br/>The maximum number of entities to return.<br/>The sum of this value of that of `offset` should be less than **1024**.<br/>The value defaults to **100**.<br/>The value ranges from **1** to **100**.|
| `offset`  | **integer**<br/>The number of entities to skip in the search results.<br/>The sum of this value and that of `limit` should not be greater than **1024**.<br/>The maximum value is **1024**.|
| `outputFields`  | **array**<br/>An array of fields to return along with the search results.|
| `vector`  | **array (number \[float32\])**(required)<br/>The query vector in the form of a list of floating numbers.|
| `params`  | **object**<br/>List of search parameters|
| `params.radius`  | **number(float64)**<br/>The angle where the vector with the least similarity resides.|
| `params.range_filter`  | **number(float64)**<br/>Used in combination to filter vector field values whose similarity to the query vector falls into a specific range.|

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
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80022 | Dedicated cluster not support this operation. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90002 | The return value property xxx does not exist on collection xxx. |
| 90004 | The parameter value for 'limit' should be between 1 and 100. |
| 90005 | The parameter value for 'offset' should not be less than 0. |
| 90006 | "The attribute xxx is not of vector type |
| 90007 | "The vector dimensions do not match on the field xxx. The input vector has a dimension of xxx |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90110 | No filter key field. |
| 90111 | The parameter value for 'level' should be between 1 and 3. |
| 90115 | The number of columns inserted does not match the defined number of columns in the set. |
| 90125 | No vector key field. |
| 90126 | The sum of the 'offset' parameter value and the 'limit' parameter value should not exceed 16384. |
| 90135 | No search content provided. |
| 90139 | "Type mismatch for field 'xxx'. expected type:xxx |

