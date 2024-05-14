---
displayed_sidebar: restfulSidebar
sidebar_position: 29
slug: /restful/query-metrics
title: Query Metrics
---

import RestHeader from '@site/src/components/RestHeader';

View metric statistics.

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
            "timestamp": "2024-03-28T04:58:06Z",
            "value": null
          },
          {
            "timestamp": "2024-03-28T09:58:06Z",
            "value": null
          },
          {
            "timestamp": "2024-03-28T14:58:06Z",
            "value": null
          }
        ]
      }
    ]
  }
}
```

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v1/clusters/{CLUSTER_ID}/metrics/query" />

---

## Example

# RESTful API Examples


## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLUSTER_ID`  | **string**(required)<br/>|

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
| __start__ | string  <br/>The starting date and time for the metric reporting period, expressed in ISO 8601 timestamp format in UTC. Include this parameter when the `period` parameter is not set.  |
| __end__ | string  <br/>The ending date and time for the metric reporting period, expressed in ISO 8601 timestamp format in UTC. Include this parameter when the `period` parameter is not set.  |
| __period__ | string  <br/>The duration over which Milvus reports the metrics, expressed in ISO 8601 duration format in UTC. Include this parameter when both `start` and `end` parameters are not set.  |
| __granularity__ | string  <br/>The time interval at which Milvus reports the metrics, expressed in ISO 8601 duration format in UTC. The minimum granularity is PT30S.  |
| __metricQueries__ | array<br/>An array of MetricQuery objects. |
| __metricQueries[]__ | object<br/> |
| __metricQueries[].name__ | string  <br/>The name of the metric to query. Valid values include **CU_COMPUTATION**, **CU_CAPACITY**, **STORAGE_USE**, **REQ_INSERT_COUNT**, **REQ_BULK_INSERT_COUNT**, **REQ_UPSERT_COUNT**, **REQ_DELETE_COUNT**, **REQ_SEARCH_COUNT**, **REQ_QUERY_COUNT**, **VECTOR_REQ_INSERT_COUNT**, **VECTOR_REQ_UPSERT_COUNT**, **VECTOR_REQ_SEARCH_COUNT**, **REQ_INSERT_LATENCY**, **REQ_BULK_INSERT_LATENCY**, **REQ_UPSERT_LATENCY**, **REQ_DELETE_LATENCY**, **REQ_SEARCH_LATENCY**, **REQ_QUERY_LATENCY**, **REQ_SUCCESS_RATE**, **REQ_FAIL_RATE**, **REQ_FAIL_RATE_INSERT**, **REQ_FAIL_RATE_BULK_INSERT**, **REQ_FAIL_RATE_UPSERT**, **REQ_FAIL_RATE_DELETE**, **REQ_FAIL_RATE_SEARCH**, **REQ_FAIL_RATE_QUERY**, **ENTITIES_LOADED**, **ENTITIES_INSERT_RATE**, **COLLECTIONS_COUNT**, **ENTITIES_COUNT**.  |
| __metricQueries[].stat__ | string  <br/>The statistical method to apply to the metric. Valid values include **AVG** (average) and **P99** (99th percentile) for latency metrics. **AVG** is available for all other metrics.  |

## Response

成功

### Response Bodies

- Response body if we process your request successfully

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
| __data__ | object<br/>The container for the response data. |
| __data[].results__ | array<br/>An array of result objects. |
| __data[].results[]__ | object<br/> |
| __data[].results[].name__ | string  <br/>The name of the metric.  |
| __data[].results[].stat__ | string  <br/>The statistical function applied to the metric.  |
| __data[].results[].unit__ | string  <br/>The unit of measurement for the metric (e.g., percent).  |
| __data[].results[][].values__ | array<br/>An array of data points. |
| __data[].results[][].values[]__ | object<br/> |
| __data[].results[][].values[].timestamp__ | string  <br/>The timestamp for the data point in ISO 8601 format.  |
| __data[].results[][].values[].value__ | string  <br/>The value of the metric at the given timestamp.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
|  | (to be added) |
