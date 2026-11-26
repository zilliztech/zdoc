---
title: "Access Log Reference | Cloud"
slug: /access-log-reference
sidebar_label: "Access Log Reference"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use this reference to identify an access-log operation, check its execution time, and inspect its results. It covers JSON, Elastic Common Schema (ECS), and OpenTelemetry (OTel) output. To enable forwarding and select fields, see Configure Access Logs. | Cloud"
type: origin
token: XWjpwaGdTi3PM9kST46cU7mpnLg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Log Reference

Use this reference to identify an access-log operation, check its execution time, and inspect its results. It covers **JSON**, Elastic Common Schema **(ECS)**, and OpenTelemetry **(OTel)** output. To enable forwarding and select fields, see [Configure Access Logs](./configure-access-logs).

## Log formats\{#log-formats}

For HTTPS forwarding, all three formats use newline-delimited JSON (NDJSON): one log entry per line. Parse each line as a JSON object, then read the record according to the selected format.

| Format | Where to find the log fields |
| --- | --- |
| JSON | Read fields directly from the object, such as `params.execution_time`. |
| ECS | Read standard fields such as `event.duration`. The full original record is an object at `zilliz.original`. |
| OTel | Read `timeUnixNano` and `attributes`. Parse `body.stringValue` as JSON to access the original record. |

`cluster_id`, `log_type`, and `user` are always included. Other fields depend on your **Output Fields** selection and the operation. Collection details, execution time, input parameters, and results are nested under `params`.

## Log fields\{#log-fields}

The tables below describe fields in the original JSON record. In ECS output, these fields are nested under `zilliz.original`; for example, `params.execution_time` becomes `zilliz.original.params.execution_time`. In OTel output, parse `body.stringValue` as JSON to read the same fields. Fields depend on the selected Output Fields and the operation; Query, for example, has no similarity scores.

### Common fields\{#common-fields}

| Field | JSON type | Description |
| --- | --- | --- |
| `cluster_id` | string | Identifier of the cluster that handled the request. |
| `log_type` | string | Log category. The value is `ACCESS`. |
| `user` | string | Identity that issued the request, such as a user name or API key identifier. |
| `action` | string | Operation name. Access logging supports `Search`, `HybridSearch`, and `Query`; your Operations selection determines which are logged. |
| `timestamp` | integer | Time of the logged request, as a Unix timestamp in milliseconds. |
| `params` | object | Operation-specific fields. Use the nested paths listed below when parsing them. |

### Request and execution fields\{#request-and-execution-fields}

| Field | JSON type | Description |
| --- | --- | --- |
| `params.collection` | string | Name of the collection accessed by the request. |
| `params.execution_time` | string | Server-side execution time, including its unit. Values can use different units, such as `23.543546ms` or `973.39µs`. Convert to a common unit before comparing durations. |
| `params.expr` | string in these examples | Filter expression. The Search example has an empty string because no filter was supplied; the Query example records `primary_key in [1,2,3]`. |
| `params.nq` | integer | Number of query vectors. The Search example contains one vector. |
| `params.limit` | integer | Requested maximum number of results. The Query example records `3`. |
| `params.input_params` | object | Additional request parameters. The Search example includes `anns_field`, `topk`, and `offset`; the Query example includes `limit`. Values inside this object can be strings, including numeric settings. |

### Result fields\{#result-fields}

| Field | JSON type | Description |
| --- | --- | --- |
| `params.result_num` | integer | Number of results returned by the operation. |
| `params.result_pks` | array | Primary keys of the returned entities. The examples use an INT64 primary key and therefore contain numbers. |
| `params.result_scores` | array of numbers | Scores corresponding to the returned search results. This field appears in the Search example and is absent from the Query example. |

### Query field differences\{#query-field-differences}

This Query filters by three primary keys. Unlike Search, it has no vector count or similarity scores. `params.limit` is a number, while `params.input_params.limit` is a string. This complete JSON record comes from an actual HTTPS delivery; cluster and caller identifiers have been replaced.

```json
{
  "action": "Query",
  "cluster_id": "in01-example",
  "log_type": "ACCESS",
  "params": {
    "collection": "docs_log_sample_20261110",
    "execution_time": "2.39537ms",
    "expr": "primary_key in [1,2,3]",
    "input_params": {
      "limit": "3"
    },
    "limit": 3,
    "result_num": 3,
    "result_pks": [
      1,
      2,
      3
    ]
  },
  "timestamp": 1794300445287,
  "user": "key-example"
}
```

## Format mappings\{#format-mappings}

Use these mappings to locate common fields in each format. In the OTel column, all names except `timeUnixNano` are keys in the `attributes` array. String attributes use `value.stringValue`.

| Field | JSON | ECS | OTel |
| --- | --- | --- | --- |
| Time | `timestamp` — milliseconds | `@timestamp` — UTC date-time | `timeUnixNano` — nanoseconds as a string |
| Duration | `params.execution_time` — string with a unit | `event.duration` — nanoseconds as a number | `event.duration` — nanoseconds in `value.intValue` (string) |
| Operation | `action` | `event.action` | `event.action` |
| Caller | `user` | `user.name` | `user.name` |
| Cluster | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| Log type | `log_type` = ACCESS | `event.dataset` = `zilliz.milvus.access` | `zilliz.log.type` = ACCESS |

Collection details, request parameters, and results remain in the original record; they are not expanded into individual fields in the mappings above. The Access examples use a selected subset of output fields, so they do not include status or trace information.

## Examples\{#examples}

The following complete records come from actual HTTPS deliveries. Identity values have been replaced; other fields and values are unchanged. Line breaks and indentation are added for readability. The examples use a collection with a 4-dimensional vector field and an INT64 primary key.

### JSON example\{#json-example}

This request searches with one vector and returns three matches. The requested result count is the string `"3"` in `params.input_params.topk`; `params.result_num` records the actual count as the number `3`.

```json
{
  "action": "Search",
  "cluster_id": "in01-example",
  "log_type": "ACCESS",
  "params": {
    "collection": "docs_log_sample_20261110",
    "execution_time": "23.543546ms",
    "expr": "",
    "input_params": {
      "anns_field": "vector",
      "offset": "0",
      "params": "{}",
      "round_decimal": "-1",
      "topk": "3"
    },
    "nq": 1,
    "result_num": 3,
    "result_pks": [
      10,
      11,
      9
    ],
    "result_scores": [
      1,
      0.9988664,
      0.9986361
    ]
  },
  "timestamp": 1794300429632,
  "user": "key-example"
}
```

### ECS example\{#ecs-example}

This Search record declares ECS version `8.11.0`. Standard fields appear alongside the full record in `zilliz.original`.

```json
{
  "@timestamp": "2026-11-10T09:23:25.97Z",
  "ecs": {
    "version": "8.11.0"
  },
  "event": {
    "action": "Search",
    "category": [
      "database"
    ],
    "dataset": "zilliz.milvus.access",
    "duration": 4868781,
    "kind": "event",
    "type": [
      "access"
    ]
  },
  "user": {
    "name": "key-example"
  },
  "zilliz": {
    "original": {
      "action": "Search",
      "cluster_id": "in01-example",
      "log_type": "ACCESS",
      "params": {
        "collection": "docs_log_sample_20261110",
        "execution_time": "4.868781ms",
        "expr": "",
        "input_params": {
          "anns_field": "vector",
          "offset": "0",
          "params": "{}",
          "round_decimal": "-1",
          "topk": "3"
        },
        "nq": 1,
        "result_num": 3,
        "result_pks": [
          10,
          11,
          9
        ],
        "result_scores": [
          1,
          0.9988664,
          0.9986361
        ]
      },
      "timestamp": 1794302605970,
      "user": "key-example"
    }
  }
}
```

### OTel example\{#otel-example}

This Search record contains the original JSON as an escaped string in `body.stringValue`, alongside mapped `attributes`. Each NDJSON line is an individual log record, without a `resourceLogs` envelope.

```json
{
  "timeUnixNano": "1794302922141000000",
  "body": {
    "stringValue": "{\"action\":\"Search\",\"cluster_id\":\"in01-example\",\"log_type\":\"ACCESS\",\"params\":{\"collection\":\"docs_log_sample_20261110\",\"execution_time\":\"1.579877ms\",\"expr\":\"\",\"input_params\":{\"anns_field\":\"vector\",\"offset\":\"0\",\"params\":\"{}\",\"round_decimal\":\"-1\",\"topk\":\"3\"},\"nq\":1,\"result_num\":3,\"result_pks\":[10,11,9],\"result_scores\":[1,0.9988664,0.9986361]},\"timestamp\":1794302922141,\"user\":\"key-example\"}"
  },
  "attributes": [
    {
      "key": "zilliz.cluster.id",
      "value": {
        "stringValue": "in01-example"
      }
    },
    {
      "key": "zilliz.log.type",
      "value": {
        "stringValue": "ACCESS"
      }
    },
    {
      "key": "user.name",
      "value": {
        "stringValue": "key-example"
      }
    },
    {
      "key": "event.action",
      "value": {
        "stringValue": "Search"
      }
    },
    {
      "key": "event.duration",
      "value": {
        "intValue": "1579877"
      }
    }
  ]
}
```

When reading `timeUnixNano` or `value.intValue`, preserve integer precision. For example, use `BigInt` for nanosecond timestamps in JavaScript.