---
title: "Access Logs Overview | BYOC"
slug: /access-log-overview
sidebar_label: "Access Logs Overview"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In high-volume workloads, understanding which data is accessed most frequently is critical for optimization decisions such as index tuning or partition strategy. Without visibility into query patterns, these decisions rely on guesswork. | BYOC"
type: origin
token: PIfLwbrMmiOZKAkqtpScjnhinXf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Logs Overview

In high-volume workloads, understanding which data is accessed most frequently is critical for optimization decisions such as index tuning or partition strategy. Without visibility into query patterns, these decisions rely on guesswork.

Access Logs give you that visibility. When enabled on a Zilliz Cloud cluster, the access log pipeline captures query activities and delivers it as structured log files to your own object storage. You can then load these logs into a data warehouse and aggregate by entity ID to identify hot data, slow queries, and usage trends.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>This release logs search- or query-class actions only: Search, HybridSearch, and Query. Support for the full action list is planned for a future release.</p></li>
<li><p>Audit log and access log are mutually exclusive in this release — only one can be enabled at a time.</p></li>
<li><p>Access logs are available only for <strong>Dedicated</strong> clusters on <strong>Enterprise</strong> projects. If your cluster is on a different plan or cluster type, consider upgrading it.</p></li>
</ul>

</Admonition>

## How the pipeline works\{#how-the-pipeline-works}

The access log pipeline has two phases: collection on the Zilliz Cloud side and analysis on yours.

![TWlbbeheTo3aOnxE5t5cEYgcnbb](https://zdoc-images.s3.us-west-2.amazonaws.com/twlbbeheto3aonxe5t5ceygcnbb.png "TWlbbeheTo3aOnxE5t5cEYgcnbb")

### Zilliz Cloud collects and delivers logs\{#zilliz-cloud-collects-and-delivers-logs}

When you enable Access Logs on a cluster, Zilliz Cloud begins capturing query activities at the proxy layer. You configure two settings at the cluster level:

- **Sample rate**: Control what percentage of requests are logged. The value ranges from 0 to 100 and represents the percentage of requests that are randomly sampled and written to access logs. For example, if you set the sample rate to 1, approximately 1% of requests will produce access log entries. For high‑volume workloads, a lower sample rate can reduce log storage costs while still providing enough data to analyze access patterns.

- **Output fields**: Control which additional response fields are included in each access log entry. Common options are:

    - `params.result_pks`: Records the list of primary key IDs returned in the query result. This lets you aggregate by entity later to identify hot data and access frequency.

    - `params.result_scores`: Records the similarity score for each ID in `params.result_pks`, helping you understand which results were high‑confidence matches and which were borderline matches.

Logs are written in **JSON Lines** format (one JSON object per line) and delivered automatically to the object storage bucket you configured during setup. Each file follows a predictable path convention:

```plaintext
/<Cluster ID>/<Log type>/<Date>/<HH:MM:SS>-<UUID>.log
```

For example: `/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log`

For more information on parameters, refer to [Access Log Reference](./access-log-reference).

### You analyze the logs\{#you-analyze-the-logs}

Because logs arrive as standard JSON Lines files in your own bucket, you can process them with any tool that reads JSON. Each log entry contains structured fields including `action`, `cluster_id`, `timestamp`, and `params.result_pks` (the list of primary keys in the query result).

The general analysis approach is:

1. Load the JSON Lines files into a data warehouse or analytics tool.

1. Parse the `action` and `params.result_pks` fields from each entry.

1. Aggregate by primary key across a time window to surface access frequency.

The result is a heat map of your data, which entities are queried most often, through which actions, and at what times.

## Reliability and billing\{#reliability-and-billing}

The access log pipeline is designed around a core principle: logging never degrades query performance.

### Non-blocking guarantee\{#non-blocking-guarantee}

Access log collection never delays or blocks user requests. If the system must choose between completing a query and writing a log entry, the query always wins.

### Graceful degradation\{#graceful-degradation}

Under extreme load, the system may drop access log entries to preserve query throughput. This means access logs provide a best-effort record of query activity rather than a guaranteed complete record.

## What's next\{#whats-next}

- [Configure Access Logs](./configure-access-logs): Enable access logs, adjust sampling rate and output params, or disable logging.

- [Access Log Reference](./access-log-reference): Full field schema, complete action list, and file path conventions.

