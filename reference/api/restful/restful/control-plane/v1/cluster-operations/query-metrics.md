---
displayed_sidebar: restfulSidebar
sidebar_position: 20
slug: /restful/query-metrics
title: Query Metrics
---

import RestHeader from '@site/src/components/RestHeader';

View metric statistics.

<RestHeader method="post" endpoint="https://controller.${CLOUD_REGION}.zillizcloud.com/v1/clusters/CLUSTER_ID/metrics/query" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request POST "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/inxx-xxxxxxxxxxxxxxx/metrics/query" \
--header "Authorization: Bearer ${API_KEY}" \
--data-raw '{
    "start": "",
    "end": "",
    "period": "PT99H",
    "granularity": "PT5H",
    "metricQueries": [
        {
            "name": "CU_CAPACITY",
            "stat": "AVG"
        }
    ]
}'
```

Possible response is similar to the following.

```json
{
    "code": 200,
    "data": {
        "results": [
            {
                "name": "CU_CAPACITY",
                "stat": "AVG",
                "unit": "percent",
                "values": [
                    {
                        "timestamp": "2024-07-06T04:27:53Z",
                        "value": null
                    },
                    {
                        "timestamp": "2024-07-06T09:27:53Z",
                        "value": null
                    },
                    {
                        "timestamp": "2024-07-06T14:27:53Z",
                        "value": null
                    }
                ]
            }
        ]
    }
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**(required)<br/>|

### Request Body

```json
{
    "start": "string",
    "end": "string",
    "period": "string",
    "granularity": "string",
    "metricQueries": [
        {
            "name": "string",
            "stat": "string"
        }
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __start__ | __string__  <br/>The starting date and time for the metric reporting period, expressed in ISO 8601 timestamp format in UTC. Include this parameter when the `period` parameter is not set.  |
| __end__ | __string__  <br/>The ending date and time for the metric reporting period, expressed in ISO 8601 timestamp format in UTC. Include this parameter when the `period` parameter is not set.  |
| __period__ | __string__  <br/>The duration over which Milvus reports the metrics, expressed in ISO 8601 duration format in UTC. Include this parameter when both `start` and `end` parameters are not set.  |
| __granularity__ | __string__  <br/>The time interval at which Milvus reports the metrics, expressed in ISO 8601 duration format in UTC. The minimum granularity is PT30S.  |
| __metricQueries__ | __array__<br/>An array of MetricQuery objects. |
| __metricQueries[]__ | __object__<br/> |
| __metricQueries[].name__ | __string__  <br/>The name of the metric to query. Valid values include **CU_COMPUTATION**, **CU_CAPACITY**, **STORAGE_USE**, **REQ_INSERT_COUNT**, **REQ_BULK_INSERT_COUNT**, **REQ_UPSERT_COUNT**, **REQ_DELETE_COUNT**, **REQ_SEARCH_COUNT**, **REQ_QUERY_COUNT**, **VECTOR_REQ_INSERT_COUNT**, **VECTOR_REQ_UPSERT_COUNT**, **VECTOR_REQ_SEARCH_COUNT**, **REQ_INSERT_LATENCY**, **REQ_BULK_INSERT_LATENCY**, **REQ_UPSERT_LATENCY**, **REQ_DELETE_LATENCY**, **REQ_SEARCH_LATENCY**, **REQ_QUERY_LATENCY**, **REQ_SUCCESS_RATE**, **REQ_FAIL_RATE**, **REQ_FAIL_RATE_INSERT**, **REQ_FAIL_RATE_BULK_INSERT**, **REQ_FAIL_RATE_UPSERT**, **REQ_FAIL_RATE_DELETE**, **REQ_FAIL_RATE_SEARCH**, **REQ_FAIL_RATE_QUERY**, **ENTITIES_LOADED**, **ENTITIES_INSERT_RATE**, **COLLECTIONS_COUNT**, **ENTITIES_COUNT**.  |
| __metricQueries[].stat__ | __string__  <br/>The statistical method to apply to the metric. Valid values include **AVG** (average) and **P99** (99th percentile) for latency metrics. **AVG** is available for all other metrics.  |

## Response

Returns the collected statistics on the queried metrics.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "results": [
            {
                "name": "string",
                "stat": "string",
                "unit": "string",
                "values": [
                    {
                        "timestamp": "string",
                        "value": "string"
                    }
                ]
            }
        ]
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/>The container for the response data. |
| __data[].results__ | __array__<br/>An array of result objects. |
| __data[].results[]__ | __object__<br/> |
| __data[].results[].name__ | __string__  <br/>The name of the metric.  |
| __data[].results[].stat__ | __string__  <br/>The statistical function applied to the metric.  |
| __data[].results[].unit__ | __string__  <br/>The unit of measurement for the metric (e.g., percent).  |
| __data[].results[][].values__ | __array__<br/>An array of data points. |
| __data[].results[][].values[]__ | __object__<br/> |
| __data[].results[][].values[].timestamp__ | __string__  <br/>The timestamp for the data point in ISO 8601 format.  |
| __data[].results[][].values[].value__ | __string__  <br/>The value of the metric at the given timestamp.  |

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

