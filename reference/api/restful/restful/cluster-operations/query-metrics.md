---
displayed_sidebar: restfulSidebar
sidebar_position: 11
slug: /restful/query-metrics
title: Query Metrics
---

import RestHeader from '@site/src/components/RestHeader';

View metric statistics.

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters/{clusterId}/metrics/query" />

---

## Example

:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --location --request POST "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/${CLUSTER_ID}/metrics/query" \
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

Success response:

```shell
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

## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `clusterId`  | **string**(required)<br/>The ID of a cluster to which this operation applies.|

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
| __start__        | **string**<br/>The starting date and time for the metric reporting period, expressed in ISO 8601 timestamp format in UTC. Include this parameter when the `period` parameter is not set.|
| __end__          | **string**<br/>The ending date and time for the metric reporting period, expressed in ISO 8601 timestamp format in UTC. Include this parameter when the `period` parameter is not set.|
| __period__       | **string**<br/>The duration over which Milvus reports the metrics, expressed in ISO 8601 duration format in UTC. Include this parameter when both `start` and `end` parameters are not set.|
| __granularity__  | **string**<br/>The time interval at which Milvus reports the metrics, expressed in ISO 8601 duration format in UTC. The minimum granularity is PT30S. |
| __metricQueries__ | **array**<br/>An array of MetricQuery objects.|
| __metricQueries[].name__ | **string**<br/>The name of the metric to query. Valid values include CU_COMPUTATION, CU_CAPACITY, STORAGE_USE, REQ_INSERT_COUNT, REQ_BULK_INSERT_COUNT, REQ_UPSERT_COUNT, REQ_DELETE_COUNT, REQ_SEARCH_COUNT, REQ_QUERY_COUNT, VECTOR_REQ_INSERT_COUNT, VECTOR_REQ_UPSERT_COUNT, VECTOR_REQ_SEARCH_COUNT, REQ_INSERT_LATENCY, REQ_BULK_INSERT_LATENCY, REQ_UPSERT_LATENCY, REQ_DELETE_LATENCY, REQ_SEARCH_LATENCY, REQ_QUERY_LATENCY, REQ_SUCCESS_RATE, REQ_FAIL_RATE, REQ_FAIL_RATE_INSERT, REQ_FAIL_RATE_BULK_INSERT, REQ_FAIL_RATE_UPSERT, REQ_FAIL_RATE_DELETE, REQ_FAIL_RATE_SEARCH, REQ_FAIL_RATE_QUERY, ENTITIES_LOADED, ENTITIES_INSERT_RATE, COLLECTIONS_COUNT, ENTITIES_COUNT. |
| __metricQueries[].stat__ | **string**<br/>The statistical method to apply to the metric. Valid values include __AVG__ (average) and P99 (99th percentile) for latency metrics. __AVG__ is available for all other metrics. |

## Response

Returns the metric statistics for the specified cluster.

### Response Bodies

- Response body if we process your request successfully.

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
            "value": "number"
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

| `data`   | **object**<br/>The container for the response data. |
| `data.results` | **array**<br/>An array of MetricResult objects, which contain the metric statistics. |
| `data.results[].name` | **string**<br/>The name of the metric. |
| `data.results[].stat` | **string**<br/>The statistical method to apply to the metric. |
| `data.results[].unit` | **string**<br/>The unit of the metric. |
| `data.results[].values` | **array**<br/>An array of MetricValue objects, which contain the metric values at different timestamps. |
| `data.results[].values[].timestamp` | **string**<br/>The timestamp of the metric value. |
| `data.results[].values[].value` | **number**<br/>The value of the metric at the corresponding timestamp. |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |