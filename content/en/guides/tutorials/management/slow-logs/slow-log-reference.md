---
title: "Slow Logs Reference | Cloud"
slug: /slow-log-reference
sidebar_label: "Slow Logs Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use this reference to check a slow request’s duration, result, and execution context. It covers JSON, Elastic Common Schema (ECS), and OpenTelemetry (OTel) output. To set the threshold and destination, see Configure Slow Logs. | Cloud"
type: origin
token: QvqMw06F7iI6oKkXiD4cjV33nCd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Slow Logs Reference

Use this reference to check a slow request’s duration, result, and execution context. It covers **JSON**, Elastic Common Schema **(ECS)**, and OpenTelemetry **(OTel)** output. To set the threshold and destination, see [Configure Slow Logs](./configure-slow-logs).

## Log formats\{#log-formats}

For HTTPS forwarding, all three formats use newline-delimited JSON (NDJSON): one log entry per line. Parse each line as a JSON object, then read the record according to the selected format.

| Format | Where to find the log fields |
| --- | --- |
| JSON | Read fields directly from the object, such as `params.execution_time`. |
| ECS | Read standard fields such as `event.duration`. The full original record is an object at `zilliz.original`. |
| OTel | Read `timeUnixNano` and `attributes`. Parse `body.stringValue` as JSON to access the original record. |

## Log fields\{#log-fields}

The tables below describe fields in the original JSON record. In ECS output, these fields are nested under `zilliz.original`; for example, `params.execution_time` becomes `zilliz.original.params.execution_time`. In OTel output, parse `body.stringValue` as JSON to read the same fields.

### Execution time and result\{#execution-time-and-result}

| Field | JSON type | Description |
| --- | --- | --- |
| `params.execution_time` | string | Recorded execution time, including its unit. The example records `1.802601ms`. Compare the duration with the configured threshold using the same unit. |
| `status` | string | Human-readable request status. The example is `Success`: a request can succeed and still qualify for slow logging. |
| `error_code` | integer | Request result code. The successful request in the example records `0`. |

### Request context\{#request-context}

| Field | JSON type | Description |
| --- | --- | --- |
| `action` | string | Operation name, such as `Search`. Slow logging covers `Search`, `HybridSearch`, and `Query`. |
| `timestamp` | integer | Time of the logged request, as a Unix timestamp in milliseconds. |
| `cluster_id` | string | Identifier of the cluster that handled the request. |
| `database` | string | Database accessed by the request. |
| `log_type` | string | Log category. The value is `SLOW`. |
| `user` | string | Identity that issued the request, such as a user name or API key identifier. |
| `interface` | string | Interface used for the request. The example uses the REST API and records `Restful`. |
| `ip` | string | Source IP address recorded for the request. |
| `trace_id` | string | Trace identifier associated with the request, useful for correlation and troubleshooting. |

### Operation parameters\{#operation-parameters}

| Field | JSON type | Description |
| --- | --- | --- |
| `params.collection` | string | Name of the collection searched. |
| `params.nq` | integer | Number of query vectors. The example contains one vector. |
| `params.output_fields` | array of strings | Entity fields requested in the response. These are collection fields, not the fields selected for a log record. |
| `params.consistency_level` | integer | Numeric consistency-level value recorded for the request. The example records `2`. |
| `params.partition` | null in this example | Partition selection recorded for the request. No partition was specified in this request, so the value is `null`. |

## Format mappings\{#format-mappings}

Use these mappings to locate common fields in each format. In the OTel column, all names except `timeUnixNano` are keys in the `attributes` array. String attributes use `value.stringValue`.

| Field | JSON | ECS | OTel |
| --- | --- | --- | --- |
| Time | `timestamp` — milliseconds | `@timestamp` — UTC date-time | `timeUnixNano` — nanoseconds as a string |
| Duration | `params.execution_time` — string with a unit | `event.duration` — nanoseconds as a number | `event.duration` — nanoseconds in `value.intValue` (string) |
| Operation | `action` | `event.action` | `event.action` |
| Caller | `user` | `user.name` | `user.name` |
| Cluster | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| Log type | `log_type` = SLOW | `event.dataset` = `zilliz.milvus.slow` | `zilliz.log.type` = SLOW |
| Outcome | `status` = `Success` | `event.outcome` = `success` | `event.outcome` = `success` |
| Client address | `ip` | `source.ip` | `source.address` |
| Trace | `trace_id` | `trace.id` | `trace.id` |

Collection details, request parameters, and error codes remain in the original record; they are not expanded into individual fields in the mappings above. The outcome mapping shown here is from successful requests.

## Examples\{#examples}

The following complete records come from actual HTTPS deliveries. Identity values have been replaced; other fields and values are unchanged. Line breaks and indentation are added for readability. A temporary 1 ms threshold was used to collect these slow logs.

### JSON example\{#json-example}

This successful Search request took `1.802601ms`, exceeding the temporary 1 ms threshold.

```json
{
  "action": "Search",
  "cluster_id": "in01-example",
  "database": "default",
  "error_code": 0,
  "interface": "Restful",
  "ip": "192.0.2.10",
  "log_type": "SLOW",
  "params": {
    "collection": "docs_log_sample_20261110",
    "consistency_level": 2,
    "execution_time": "1.802601ms",
    "nq": 1,
    "output_fields": [
      "primary_key"
    ],
    "partition": null
  },
  "status": "Success",
  "timestamp": 1794300563698,
  "trace_id": "0123456789abcdef0123456789abcdef",
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
    "dataset": "zilliz.milvus.slow",
    "duration": 4868781,
    "kind": "event",
    "outcome": "success",
    "type": [
      "access"
    ]
  },
  "source": {
    "ip": "192.0.2.10"
  },
  "trace": {
    "id": "0123456789abcdef0123456789abcdef"
  },
  "user": {
    "name": "key-example"
  },
  "zilliz": {
    "original": {
      "action": "Search",
      "cluster_id": "in01-example",
      "database": "default",
      "error_code": 0,
      "interface": "Restful",
      "ip": "192.0.2.10",
      "log_type": "SLOW",
      "params": {
        "collection": "docs_log_sample_20261110",
        "consistency_level": 2,
        "execution_time": "4.868781ms",
        "nq": 1,
        "output_fields": [
          "primary_key"
        ],
        "partition": null
      },
      "status": "Success",
      "timestamp": 1794302605970,
      "trace_id": "0123456789abcdef0123456789abcdef",
      "user": "key-example"
    }
  }
}
```

### OTel example\{#otel-example}

This Search record contains the original JSON as an escaped string in `body.stringValue`, alongside mapped `attributes`. Each NDJSON line is an individual log record, without a `resourceLogs` envelope.

```json
{
  "timeUnixNano": "1794302922142000000",
  "body": {
    "stringValue": "{\"action\":\"Search\",\"cluster_id\":\"in01-example\",\"database\":\"default\",\"error_code\":0,\"interface\":\"Restful\",\"ip\":\"192.0.2.10\",\"log_type\":\"SLOW\",\"params\":{\"collection\":\"docs_log_sample_20261110\",\"consistency_level\":2,\"execution_time\":\"1.579877ms\",\"nq\":1,\"output_fields\":[\"primary_key\"],\"partition\":null},\"status\":\"Success\",\"timestamp\":1794302922142,\"trace_id\":\"0123456789abcdef0123456789abcdef\",\"user\":\"key-example\"}"
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
        "stringValue": "SLOW"
      }
    },
    {
      "key": "user.name",
      "value": {
        "stringValue": "key-example"
      }
    },
    {
      "key": "source.address",
      "value": {
        "stringValue": "192.0.2.10"
      }
    },
    {
      "key": "event.action",
      "value": {
        "stringValue": "Search"
      }
    },
    {
      "key": "event.outcome",
      "value": {
        "stringValue": "success"
      }
    },
    {
      "key": "trace.id",
      "value": {
        "stringValue": "0123456789abcdef0123456789abcdef"
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