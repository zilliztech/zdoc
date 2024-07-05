---
displayed_sidebar: restfulSidebar
sidebar_position: 37
slug: /restful/search-v2
title: Search
---

import RestHeader from '@site/src/components/RestHeader';

This operation conducts a vector similarity search with an optional scalar filtering expression.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" />

---

import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

This API is not generally available yet, and is subject to change.

</Admonition>

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "color"
    ]
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        {
            "color": "pink_8682",
            "distance": 1,
            "id": 0
        },
        {
            "color": "red_7025",
            "distance": 0.6290165,
            "id": 1
        },
        {
            "color": "red_4794",
            "distance": 0.5975797,
            "id": 4
        }
    ]
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
    "data": [],
    "annsField": "string",
    "filter": "string",
    "limit": "integer",
    "offset": "integer",
    "groupingField": "string",
    "outputFields": [],
    "searchParams": {
        "metricType": "string",
        "params": {
            "radius": "integer",
            "range_filter": "integer"
        }
    },
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of the database.  |
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __data__ | __array__<br/>A list of vector embeddings.<br/><include target="milvus">Milvus</include><include target="zilliz">Zilliz Cloud</include> searches for the most similar vector embeddings to the specified ones. |
| __data[]__ | __number__ (float32) <br/>A vector embedding  |
| __annsField__ | __string__  <br/>The name of the vector field.  |
| __filter__ | __string__  <br/>The filter used to find matches for the search.  |
| __limit__ | __integer__  <br/>The total number of entities to return.<br/>You can use this parameter in combination with **offset** in **param** to enable pagination.
The sum of this value and **offset** in **param** should be less than 16,384.  |
| __offset__ | __integer__  <br/>The number of records to skip in the search result.      You can use this parameter in combination with limit to enable pagination.     The sum of this value and limit should be less than 16,384.  |
| __groupingField__ | __string__  <br/>The name of the field that serves as the aggregation criteria.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>A field name  |
| __searchParams__ | __object__<br/>The parameter settings specific to this operation. |
| __searchParams.metricType__ | __string__  <br/>The name of the metric type that applies to the current search. The value should be the same as the metric type of the target collection.<br/>The value defaults to COSINE  |
| __searchParams.params__ | __object__<br/>Extra search parameters. |
| __searchParams.params.radius__ | __integer__  <br/>Determines the threshold of least similarity. When setting metric_type to L2, ensure that this value is greater than that of range_filter. Otherwise, this value should be lower than that of range_filter.  |
| __searchParams.params.range_filter__ | __integer__  <br/>Refines the search to vectors within a specific similarity range. When setting metric_type to IP or COSINE, ensure that this value is greater than that of radius. Otherwise, this value should be lower than that of radius.  |
| __partitionNames__ | __array__<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | __string__  <br/>PartitionName  |

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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

