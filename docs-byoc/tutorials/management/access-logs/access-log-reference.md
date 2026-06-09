---
title: "Access Log Reference | BYOC"
slug: /access-log-reference
sidebar_label: "Access Log Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Access logs are delivered in JSON Lines format - one JSON object per line. Each line is a self-contained JSON object representing a single operation. The following example shows a log entry of the Search operation | BYOC"
type: origin
token: TeLbw6guCimFLgkQWdmcZB2unMd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Log Reference

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

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Required</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Example</strong></p></th>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>The operation name. See <a href="./access-log-reference#supported-actions">Supported actions</a>.</p></td>
     <td><p><code>"Search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>The unique identifier of the cluster.</p></td>
     <td><p><code>"inxx-xxxxxxxxxxxxxxx"</code></p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>The database where the operation occurred.</p></td>
     <td><p><code>"default"</code></p></td>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>Human-readable timestamp with timezone.</p></td>
     <td><p><code>"2026/04/14 06:31:16.827 +00:00"</code></p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>The interface type: <code>Restful</code> or <code>Grpc</code>.</p></td>
     <td><p><code>"Restful"</code></p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>Log category: <code>ACCESS</code>, <code>AUDIT</code>, or <code>SLOW</code>.</p></td>
     <td><p><code>"ACCESS"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Yes</p></td>
     <td><p>object</p></td>
     <td><p>Action-specific parameters. See <a href="./access-log-reference#params-fields">below</a> for nested fields.</p></td>
     <td><p><code>--</code></p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Yes</p></td>
     <td><p>int</p></td>
     <td><p>The operation result code. <code>0</code> indicates success; non-zero values indicate errors.</p></td>
     <td><p><code>0</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>Human-readable status of the operation.</p></td>
     <td><p><code>"Success"</code></p></td>
   </tr>
   <tr>
     <td><p><code>timestamp</code></p></td>
     <td><p>Yes</p></td>
     <td><p>int</p></td>
     <td><p>Unix timestamp in milliseconds (13 digits) when the proxy received the request.</p></td>
     <td><p><code>1776148276827</code></p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>A unique ID for the operation. Use this to correlate multiple log entries belonging to the same request.</p></td>
     <td><p><code>"f89903d701329910380442aa86941be9"</code></p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>The user or API key that issued the request.</p></td>
     <td><p><code>"key-ibchakktguxxrvvxseoasz"</code></p></td>
   </tr>
</table>

### params fields\{#params-fields}

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Required</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Example</strong></p></th>
   </tr>
   <tr>
     <td><p><code>params.collection</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>The target collection. Required for Search, HybridSearch, and Query actions.</p></td>
     <td><p><code>"ccc1"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.consistency_level</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>The consistency level used for the operation.</p></td>
     <td><p><code>2</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.execution_time</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>Server-side execution time, measured from when the proxy receives the full payload to when it begins sending the response. Does not include network transit time.</p></td>
     <td><p><code>"15.368706ms"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.expr</code></p></td>
     <td><p>No</p></td>
     <td><p>string or array</p></td>
     <td><p>The filter expression passed with the request. For HybridSearch, this is an array of expressions (one per sub-request).</p></td>
     <td><p><code>"" or [""]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.input_params</code></p></td>
     <td><p>No</p></td>
     <td><p>object</p></td>
     <td><p>Input parameters for the operation (search params, offset, topk, etc.). For HybridSearch, includes <code>sub_0.&ast;</code> prefixed sub-request parameters and <code>strategy</code>.</p></td>
     <td><p><code>\{"topk": "10", "offset": "0"\}</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.limit</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>The limit on the number of results to return. Appears for Query and HybridSearch actions.</p></td>
     <td><p><code>100</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.nq</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>The number of query vectors. Appears for Search actions.</p></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.output_fields</code></p></td>
     <td><p>No</p></td>
     <td><p>array</p></td>
     <td><p>The output fields requested in the query.</p></td>
     <td><p><code>["&ast;"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.partition</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>The target partition, if specified. <code>null</code> when no partition is specified.</p></td>
     <td><p><code>null</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_num</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>The actual number of results returned by the operation.</p></td>
     <td><p><code>10</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_pks</code></p></td>
     <td><p>No</p></td>
     <td><p>array</p></td>
     <td><p>The primary keys in the query result. Appears for Search, HybridSearch, and Query actions when output params are configured to include it.</p></td>
     <td><p><code>[55, 19, 18, 10]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_scores</code></p></td>
     <td><p>No</p></td>
     <td><p>array</p></td>
     <td><p>The similarity scores corresponding to each entry in <code>params.result_pks</code>. Appears for Search and HybridSearch actions.</p></td>
     <td><p><code>[0.87269604, 0.8639183]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.topk</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>The topk parameter for the search request. Appears for Search and HybridSearch actions.</p></td>
     <td><p><code>10</code></p></td>
   </tr>
</table>

## Supported actions\{#supported-actions}

This release logs search- or query-class actions only:

<table>
   <tr>
     <th><p>Action</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>Vector similarity search</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>Multi-vector search with reranking</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>Scalar filtering query</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Support for additional actions is planned for a future release.</p>

</Admonition>

## File path and naming\{#file-path-and-naming}

Log files are organized in your object storage bucket with the following path structure:

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

<table>
   <tr>
     <th><p><strong>Component</strong></p></th>
     <th><p><strong>Format</strong></p></th>
     <th><p><strong>Example</strong></p></th>
   </tr>
   <tr>
     <td><p>Cluster ID</p></td>
     <td><p>The cluster's unique identifier</p></td>
     <td><p><code>inxx-xxxxxxxxxxxxxxx</code></p></td>
   </tr>
   <tr>
     <td><p>Log type</p></td>
     <td><p>access, audit, or slow</p></td>
     <td><p><code>access</code></p></td>
   </tr>
   <tr>
     <td><p>Date</p></td>
     <td><p>ISO date (YYYY-MM-DD)</p></td>
     <td><p><code>2024-12-20</code></p></td>
   </tr>
   <tr>
     <td><p>File name</p></td>
     <td><p>HH:MM:SS-&lt;UUID&gt;, where HH:MM:SS is the UTC time and &lt;UUID&gt; is a random string for uniqueness</p></td>
     <td><p><code>09:16:53-jz5l7D8Q</code></p></td>
   </tr>
   <tr>
     <td><p>File name suffix</p></td>
     <td><p>.log</p></td>
     <td><p><code>.log</code></p></td>
   </tr>
</table>

Full path example:

```plaintext
/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

