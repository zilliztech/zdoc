---
title: "Access Log Reference | Cloud"
slug: /access-log-reference
sidebar_label: "Access Log Reference"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Access logs are delivered in JSON Lines format - one JSON object per line. Each line is a self-contained JSON object representing a single operation. The following example shows a log entry of the Search operation | Cloud"
type: origin
token: TeLbw6guCimFLgkQWdmcZB2unMd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Log Reference

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only with the Enterprise plan or higher, and BYOC deployments.

</FeatureNote>

Access logs are delivered in [JSON Lines](https://jsonlines.org/) format - one JSON object per line. Each line is a self-contained JSON object representing a single operation. The following example shows a log entry of the Search operation:

```json
{
    "action": "Search",
    "cluster_id": "inxx-xxxxxxxxxxxxxxx",
    "database": "default",
    "date": "2026/04/14 06:31:16.827 +00:00",
    "interface": "Restful",
    "log_type": "ACCESS",
    "params": {
        "collection": "ccc1",
        "consistency_level": 2,
        "execution_time": "15.368706ms",
        "expr": "",
        "input_params": {
            "anns_field": "",
            "offset": "0",
            "params": "{}",
            "round_decimal": "-1",
            "topk": "10"
        },
        "nq": 1,
        "output_fields": ["*"],
        "partition": null,
        "result_num": 10,
        "result_pks": [55, 19, 18, 10, -26, 115, -14, -96, -50, 9],
        "result_scores": [0.87269604, 0.8639183, 0.8605273, 0.85245466, 0.8490447, 0.84537137, 0.84066796, 0.8314183, 0.8296911, 0.82586515],
        "topk": 10
    },
    "result": 0,
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
| `action` | Yes | string | The operation name. See [Supported actions](./access-log-reference#supported-actions). | `"Search"` |
| `cluster_id` | Yes | string | The unique identifier of the cluster. | `"inxx-xxxxxxxxxxxxxxx"` |
| `database` | No | string | The database where the operation occurred. | `"default"` |
| `date` | Yes | string | Human-readable timestamp with timezone. | `"2026/04/14 06:31:16.827 +00:00"` |
| `interface` | Yes | string | The interface type: `Restful` or `Grpc`. | `"Restful"` |
| `log_type` | Yes | string | Log category: `ACCESS`, `AUDIT`, or `SLOW`. | `"ACCESS"` |
| `params` | Yes | object | Action-specific parameters. See [below](./access-log-reference#params-fields) for nested fields. | `--` |
| `result` | Yes | int | The operation result code. `0` indicates success; non-zero values indicate errors. | `0` |
| `status` | Yes | string | Human-readable status of the operation. | `"Success"` |
| `timestamp` | Yes | int | Unix timestamp in milliseconds (13 digits) when the proxy received the request. | `1776148276827` |
| `trace_id` | Yes | string | A unique ID for the operation. Use this to correlate multiple log entries belonging to the same request. | `"f89903d701329910380442aa86941be9"` |
| `user` | Yes | string | The user or API key that issued the request. | `"key-ibchakktguxxrvvxseoasz"` |

### params fields\{#params-fields}

| **Field** | **Required** | **Type** | **Description** | **Example** |
| --- | --- | --- | --- | --- |
| `params.collection` | No | string | The target collection. Required for Search, HybridSearch, and Query actions. | `"ccc1"` |
| `params.consistency_level` | No | int | The consistency level used for the operation. | `2` |
| `params.execution_time` | No | string | Server-side execution time, measured from when the proxy receives the full payload to when it begins sending the response. Does not include network transit time. | `"15.368706ms"` |
| `params.expr` | No | string or array | The filter expression passed with the request. For HybridSearch, this is an array of expressions (one per sub-request). | `"" or [""]` |
| `params.input_params` | No | object | Input parameters for the operation (search params, offset, topk, etc.). For HybridSearch, includes `sub_0.*` prefixed sub-request parameters and `strategy`. | `{"topk": "10", "offset": "0"}` |
| `params.limit` | No | int | The limit on the number of results to return. Appears for Query and HybridSearch actions. | `100` |
| `params.nq` | No | int | The number of query vectors. Appears for Search actions. | `1` |
| `params.output_fields` | No | array | The output fields requested in the query. | `["*"]` |
| `params.partition` | No | string | The target partition, if specified. `null` when no partition is specified. | `null` |
| `params.result_num` | No | int | The actual number of results returned by the operation. | `10` |
| `params.result_pks` | No | array | The primary keys in the query result. Appears for Search, HybridSearch, and Query actions when output params are configured to include it. | `[55, 19, 18, 10]` |
| `params.result_scores` | No | array | The similarity scores corresponding to each entry in `params.result_pks`. Appears for Search and HybridSearch actions. | `[0.87269604, 0.8639183]` |
| `params.topk` | No | int | The topk parameter for the search request. Appears for Search and HybridSearch actions. | `10` |

## Supported actions\{#supported-actions}

This release logs search- or query-class actions only:

| Action | Description |
| --- | --- |
| Search | Vector similarity search |
| HybridSearch | Multi-vector search with reranking |
| Query | Scalar filtering query |

<Admonition type="info" icon="📘" title="Notes">

Support for additional actions is planned for a future release.

</Admonition>

## File path and naming\{#file-path-and-naming}

Log files are organized in your object storage bucket with the following path structure:

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

| **Component** | **Format** | **Example** |
| --- | --- | --- |
| Cluster ID | The cluster's unique identifier | `inxx-xxxxxxxxxxxxxxx` |
| Log type | access, audit, or slow | `access` |
| Date | ISO date (YYYY-MM-DD) | `2024-12-20` |
| File name | HH:MM:SS-&lt;UUID&gt;, where HH:MM:SS is the UTC time and &lt;UUID&gt; is a random string for uniqueness | `09:16:53-jz5l7D8Q` |
| File name suffix | .log | `.log` |

Full path example:

```plaintext
/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

