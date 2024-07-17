---
displayed_sidebar: restfulSidebar
sidebar_position: 77
slug: /restful/hybrid-search-v2
title: Hybrid Search
---

import RestHeader from '@site/src/components/RestHeader';



<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "test_collection_2024_06_21_14_32_54_951152jqKAxWVu",
    "search": [
        {
            "data": [
                [
                    0.673437956701697,
                    0.739243747672878
                ]
            ],
            "annsField": "float_vector_1",
            "limit": 10,
            "outputFields": [
                "*"
            ]
        },
        {
            "data": [
                [
                    0.075384179256879,
                    0.9971545645073111
                ]
            ],
            "annsField": "float_vector_2",
            "limit": 10,
            "outputFields": [
                "*"
            ]
        }
    ],
    "rerank": {
        "strategy": "rrf",
        "params": {
            "k": 10
        }
    },
    "limit": 3,
    "outputFields": [
        "user_id",
        "word_count",
        "book_describe"
    ]
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "cost": 0,
    "data": [
        {
            "book_describe": "book_105",
            "distance": 0.09090909,
            "id": 450519760774180816,
            "user_id": 5,
            "word_count": 105
        },
        {
            "book_describe": "book_246",
            "distance": 0.09090909,
            "id": 450519760774180957,
            "user_id": 46,
            "word_count": 246
        },
        {
            "book_describe": "book_367",
            "distance": 0.08333333600000001,
            "id": 450519760774181078,
            "user_id": 67,
            "word_count": 367
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
    "collectionName": "string",
    "partitionNames": [],
    "search": [
        {
            "data": [],
            "annsField": "string",
            "filter": "string",
            "groupingField": "string",
            "metricType": "string",
            "limit": "integer",
            "offset": "integer",
            "ignoreGrowing": "boolean",
            "params": {
                "radius": "integer",
                "range_filter": "integer"
            }
        }
    ],
    "rerank": {
        "strategy": "string",
        "params": {
            "k": "integer"
        }
    },
    "limit": "integer",
    "outputFields": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __partitionNames__ | __array__<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | __string__  <br/>PartitionName  |
| __search__ | __array__<br/>The search parameters |
| __search[]__ | __object__<br/>Search parameter for a vector field. |
| __search[][].data__ | __array__<br/>A list of vector embeddings.<include target="milvus">Milvus</include><include target="zilliz">Zilliz Cloud</include> searches for the most similar vector embeddings to the specified ones. |
| __search[][].data[]__ | __number__ (float32) <br/>A vector embedding  |
| __search[].annsField__ | __string__  <br/>The name of the vector field.  |
| __search[].filter__ | __string__  <br/>A boolean expression filter.  |
| __search[].groupingField__ | __string__  <br/>The name of the field that serve as the aggregation criteria.  |
| __search[].metricType__ | __string__  <br/>The name of the metric type that applies to the current search. The value should be the same as the metric type of the target collection.<br/>The value defaults to COSINE<br/>Possible values: "**L2**", "**IP**", "**COSINE**"  |
| __search[].limit__ | __integer__  <br/>The number of entities to return.  |
| __search[].offset__ | __integer__  <br/>The number of entities to skip in the returned entities.  |
| __search[].ignoreGrowing__ | __boolean__  <br/>Whether to ignore the entities found in the growing segments.  |
| __search[].params__ | __object__<br/>Extra search parameters. |
| __search[].params.radius__ | __integer__  <br/>Determines the threshold of least similarity. When setting metric_type to L2, ensure that this value is greater than that of range_filter. Otherwise, this value should be lower than that of range_filter.  |
| __search[].params.range_filter__ | __integer__  <br/>Refines the search to vectors within a specific similarity range. When setting metric_type to IP or COSINE, ensure that this value is greater than that of radius. Otherwise, this value should be lower than that of radius.  |
| __rerank__ | __object__<br/>The reranking strategy. |
| __rerank.strategy__ | __string__  <br/>The name of the reranking strategy.<br/>Possible values: "**rrf**", "**ws**"  |
| __rerank.params__ | __object__<br/>A set of parameters related to the specified strategy |
| __rerank.params.k__ | __integer__  <br/>A tunable constant in the RRF algorithm. This applies only when the strategy is set to `rrf`.  |
| __limit__ | __integer__  <br/>The total number of entities to return.<br/>You can use this parameter in combination with **offset** in **param** to enable pagination.
The sum of this value and **offset** in **param** should be less than 16,384.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>A field name  |

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

