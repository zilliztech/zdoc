---
title: "Slow Logs Reference | BYOC"
slug: /slow-log-reference
sidebar_label: "Slow Logs Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Slow logs are delivered in JSON Lines format - one JSON object per line. Each line is a self-contained JSON object representing a single operation. The following example shows a representative slow log entry for a search request | BYOC"
type: origin
token: Ke8ownBFFiAmZFkBnWec81qEn70
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Slow Logs Reference

Slow logs are delivered in [JSON Lines](https://jsonlines.org/) format - one JSON object per line. Each line is a self-contained JSON object representing a single operation. The following example shows a representative slow log entry for a search request:

```json
{
  "action": "Search",
  "cluster_id": "inxx-xxxxxxxxxxxxxxx",
  "collection": "medium_articles",
  "connection_uid": "453798218345292801",
  "consistency_level": "Bounded",
  "database": "default",
  "error_code": 0,
  "execution_time": "231.4ms",
  "interface": "Grpc",
  "ip": "203.0.113.10",
  "log_type": "SLOW",
  "output_fields": ["title", "author"],
  "partition": null,
  "sdk": "pymilvus",
  "sdk_version": "2.6.0",
  "status": "Success",
  "timestamp": 1776148276827,
  "trace_id": "f89903d701329910380442aa86941be9",
  "user": "key-ibchakktguxxrvvxseoasz"
}
```

In practice, each entry occupies a single line in the `.log` file. The sections below describe each field in detail.

## Log field schema\{#log-field-schema}

| **Field** | **Required** | **Type** | **Description** | **Example** |
| --- | --- | --- | --- | --- |
| `action` | No | string | The operation name, such as  `Query`, `Search`, or `Hybrid Search`. | `"Search"` |
| `cluster_id` | Yes | string | The unique identifier of the cluster. This field is required by the downstream log pipeline. | `"inxx-xxxxxxxxxxxxxxx"` |
| `collection` | No | string | The target collection when the action is collection-scoped. | `"medium_articles"` |
| `connection_uid` | No | string | The internal connection identifier associated with the request. | `"453798218345292801"` |
| `consistency_level` | No | string | The consistency level used by the request. | `"Bounded"` |
| `database` | No | string | The database where the operation occurred. | `"default"` |
| `error_code` | No | int | The request result code. `0` typically indicates success. | `0` |
| `execution_time` | No | string | The measured execution time used to determine whether the request should be emitted to slow log. | `"231.4ms"` |
| `interface` | No | string | The request interface, typically `Grpc` or `Restful`. | `"Grpc"` |
| `ip` | No | string | The client IP address recorded for the request. | `"203.0.113.10"` |
| `log_type` | Yes | string | The log category. For slow log entries, the value is `SLOW`. | `"SLOW"` |
| `output_fields` | No | array | The output fields requested by the query, when applicable. | `["title", "author"]` |
| `partition` | No | string or null | The target partition. The value is `null` when no partition is specified. | `null` |
| `sdk` | No | string | The client SDK name. | `"pymilvus"` |
| `sdk_version` | No | string | The client SDK version. | `"2.6.0"` |
| `status` | No | string | The human-readable request status. | `"Success"` |
| `timestamp` | Yes | int | Unix timestamp in milliseconds. This field is required by the object storage sink when generating the final file path. | `1776148276827` |
| `trace_id` | No | string | A unique request trace identifier for correlation and troubleshooting. | `"f89903d701329910380442aa86941be9"` |
| `user` | Yes | string | The user name or API key that issued the request. This field is also used by the pipeline filter. | `"key-ibchakktguxxrvvxseoasz"` |

## Supported actions\{#supported-actions}

The current slow logs feature enables the following actions by default:

| Action | Description |
| --- | --- |
| Search | Vector similarity search |
| HybridSearch | Multi-vector search with reranking |
| Query | Scalar filtering query |

## File path and naming\{#file-path-and-naming}

Slow log files are uploaded to object storage under the `slow` directory and use UTC date and time in the final object key.

```plaintext
/<Cluster ID>/slow/<Date>/<File name>.log
```

| **Component** | **Format** | **Example** |
| --- | --- | --- |
| Cluster ID | The cluster unique identifier. | `inxx-xxxxxxxxxxxxxxx` |
| Log type directory | Fixed as `slow`. | `slow` |
| Date | UTC date in `YYYY-MM-DD` format. | `2026-04-14` |
| File name | `HH:MM:SS-<UUID>.log`, using UTC time. | `06:31:16-jz5l7D8Q.log` |

Full path example:

```plaintext
/inxx-xxxxxxxxxxxxxxx/slow/2026-04-14/06:31:16-jz5l7D8Q.log
```
