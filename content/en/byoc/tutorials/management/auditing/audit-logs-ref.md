---
title: "VectorDB Audit Logs Reference | BYOC"
slug: /audit-logs-ref
sidebar_label: "VectorDB Audit Logs Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use this reference to identify who performed a database operation, check its recorded outcome, and correlate its audit records. It covers JSON, Elastic Common Schema (ECS), and OpenTelemetry (OTel) output. For setup instructions, see VectorDB Audit Logs. | BYOC"
type: origin
token: IrxCwX9Hoi2BYckqDdjcSN7ynkh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB Audit Logs Reference

Use this reference to identify who performed a database operation, check its recorded outcome, and correlate its audit records. It covers **JSON**, Elastic Common Schema **(ECS)**, and OpenTelemetry **(OTel)** output. For setup instructions, see [VectorDB Audit Logs](./audit-logs).

## Log formats\{#log-formats}

For HTTPS forwarding, each request body contains newline-delimited JSON (NDJSON): one audit record per line. Parse each line separately, then read the fields according to the selected format.

| Format | Where to find the audit fields |
| --- | --- |
| JSON | Read fields directly from the object, such as `action` and `params.execution_time`. |
| ECS | Use standard fields such as `event.action` and `event.duration`. The full original record is an object at `zilliz.original`. |
| OTel | Use `timeUnixNano` and `attributes`. Parse `body.stringValue` as JSON to read the original record. |

## Log fields\{#log-fields}

The field tables use paths in the original JSON record. In ECS, prefix each path with `zilliz.original` and a dot. In OTel, read them after parsing `body.stringValue`. Fields vary by operation, interface, and record stage.

### Common fields\{#common-fields}

| Field | Type | Meaning |
| --- | --- | --- |
| `action` | string | Operation name, such as `ShowCollections` or `Query`. |
| `user` | string | The database user or API key identifier associated with the operation. |
| `cluster_id` | string | Identifier of the cluster where the operation occurred. |
| `database` | string | Database associated with the operation. |
| `interface` | string | Request interface, such as `Restful` or `Grpc`. |
| `log_type` | string | `AUDIT` for VectorDB audit records. |
| `timestamp` | integer | Record timestamp in Unix milliseconds. |
| `trace_id` | string | Trace identifier used to correlate records for a request. |
| `params` | object | Operation-specific details. Its contents vary by operation and record stage. |

Within `params`, look for details relevant to the operation, such as `collection`, `expr` (filter expression), or `input_params`. A field present for one operation may be absent for another.

### Result and execution time fields\{#result-and-execution-time-fields}

| Field | How to interpret it |
| --- | --- |
| `result` | The operation result code. `0` indicates success; failed responses can contain a nonzero code. This is not the HTTP status code. |
| `status` | The recorded outcome, such as `Success` or `Failed`. Request records may omit this field. |
| `params.execution_time` | Execution duration as a string with a unit, such as `3.568487ms` or `384.774µs`. Parse the unit rather than assuming every value is in milliseconds. |

A missing `result` or `status` does not prove success or failure. Find the corresponding response record before interpreting the outcome. These fields describe the outcome recorded by audit logging; also check the API response when investigating an error.

For example, a Query with an incomplete filter expression produced `result: 1100` and `status: Failed`. Its OTel `event.outcome` attribute was `failure`.

### Connection and SDK fields\{#connection-and-sdk-fields}

gRPC records can also include the following connection metadata. These fields are absent from the REST examples below.

| Field | Type | Meaning |
| --- | --- | --- |
| `connection_uid` | integer | Identifier of the client connection. |
| `params.sdk` | string | SDK language recorded for the connection, such as `Java`. |
| `params.sdk_version` | string | SDK version recorded for the connection. |

### Request and response records\{#request-and-response-records}

A single operation can produce separate request and response records. This JSON request identifies the operation and actor; it does not yet contain the outcome. Its corresponding response appears in the JSON example below.

```json
{
  "action": "ShowCollections",
  "cluster_id": "<cluster-id>",
  "database": "default",
  "interface": "Restful",
  "log_type": "AUDIT",
  "timestamp": 1793876926440,
  "trace_id": "<same-trace-id>",
  "user": "<database-user>"
}
```

Use `trace_id` to correlate the request with its response, not as a unique record ID. The two records describe different stages of the same request. Deduplicating solely by `trace_id` would discard one of them. In ECS, use `trace.id`; in OTel, use the attribute with key `trace.id`.

## Format mappings\{#format-mappings}

Use these mappings to locate common audit fields. In the OTel column, all names except `timeUnixNano` are keys in the `attributes` array. String attributes use `value.stringValue`.

| Field | JSON | ECS | OTel |
| --- | --- | --- | --- |
| Time | `timestamp` — Unix milliseconds | `@timestamp` — UTC date-time | `timeUnixNano` — nanoseconds as a string |
| Operation | `action` | `event.action` | `event.action` |
| Caller | `user` | `user.name` | `user.name` |
| Cluster | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| Log type | `log_type` = `AUDIT` | `event.dataset` = `zilliz.milvus.audit` | `zilliz.log.type` = `AUDIT` |
| Trace | `trace_id` | `trace.id` | `trace.id` |
| Duration | `params.execution_time` — string with a unit | `event.duration` — nanoseconds as a number | `event.duration` — nanoseconds in `value.intValue` (string) |
| Outcome | `status` (for example, `Success`) | `event.outcome` (for example, `success`) | `event.outcome` (for example, `success`) |

Request records can omit duration and outcome. Operation parameters and numeric `result` codes remain in the original record. A mapped outcome describes the recorded audit status, not an HTTP status code.

## Examples\{#examples}

These complete response records come from actual HTTPS deliveries. Each shows a successful `ShowCollections` operation from a separate request. Identity values have been replaced; other fields and values are unchanged. Indentation is added for readability.

### JSON example\{#json-example}

This response shares the request’s `trace_id` and adds the recorded outcome and execution time.

```json
{
  "action": "ShowCollections",
  "cluster_id": "<cluster-id>",
  "database": "default",
  "interface": "Restful",
  "log_type": "AUDIT",
  "timestamp": 1793876926443,
  "trace_id": "<same-trace-id>",
  "user": "<database-user>",
  "params": {
    "execution_time": "3.568487ms"
  },
  "result": 0,
  "status": "Success"
}
```

### ECS example\{#ecs-example}

This response declares ECS version `8.11.0` and retains the full audit record in `zilliz.original`.

```json
{
  "@timestamp": "2026-11-11T02:09:55.737Z",
  "ecs": {
    "version": "8.11.0"
  },
  "event": {
    "action": "ShowCollections",
    "category": [
      "database"
    ],
    "dataset": "zilliz.milvus.audit",
    "duration": 7963611,
    "kind": "event",
    "outcome": "success",
    "type": [
      "access"
    ]
  },
  "trace": {
    "id": "0000000000000000000000000000000a"
  },
  "user": {
    "name": "key-example"
  },
  "zilliz": {
    "original": {
      "action": "ShowCollections",
      "cluster_id": "in01-example",
      "database": "default",
      "interface": "Restful",
      "log_type": "AUDIT",
      "params": {
        "execution_time": "7.963611ms"
      },
      "result": 0,
      "status": "Success",
      "timestamp": 1794362995737,
      "trace_id": "0000000000000000000000000000000a",
      "user": "key-example"
    }
  }
}
```

### OTel example\{#otel-example}

The original audit record is an escaped JSON string in `body.stringValue`. Each NDJSON line contains one log record, without a `resourceLogs` envelope.

```json
{
  "timeUnixNano": "1794363609012000000",
  "body": {
    "stringValue": "{\"action\":\"ShowCollections\",\"cluster_id\":\"in01-example\",\"database\":\"default\",\"interface\":\"Restful\",\"log_type\":\"AUDIT\",\"params\":{\"execution_time\":\"3.3319ms\"},\"result\":0,\"status\":\"Success\",\"timestamp\":1794363609012,\"trace_id\":\"00000000000000000000000000000020\",\"user\":\"key-example\"}"
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
        "stringValue": "AUDIT"
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
        "stringValue": "ShowCollections"
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
        "stringValue": "00000000000000000000000000000020"
      }
    },
    {
      "key": "event.duration",
      "value": {
        "intValue": "3331900"
      }
    }
  ]
}
```

Preserve integer precision when reading `timeUnixNano` and `value.intValue`. For example, use `BigInt` for nanosecond timestamps in JavaScript.