---
title: "Access Logs Overview | Cloud"
slug: /access-log-overview
sidebar_label: "Access Logs Overview"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Access logs record search and query activity on a cluster. Use them with your own analytics tools to understand request performance and how applications use your data. | Cloud"
type: origin
token: KiCTwoFPCiVWCUkJtSecFryfn7g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Logs Overview

Access logs record search and query activity on a cluster. Use them with your own analytics tools to understand request performance and how applications use your data.

## When to use access logs\{#when-to-use-access-logs}

- **Find frequently returned entities.** Identify which entities appear most often in search and query results.

- **Investigate request performance.** Compare recorded request durations to find patterns in slow searches and queries.

- **Examine search result scores.** Analyze the scores associated with returned results for Search and HybridSearch requests.

## How access logs work\{#how-access-logs-work}

You control what Zilliz Cloud records and where the logs go:

1. **Choose what to record.** Select from Search, HybridSearch, and Query operations. Adjust sampling to control log volume, and choose the request and result details needed for your analysis.

1. **Forward the logs.** Prepare an object storage or HTTPS Endpoint integration in the cluster's project, then enable access log forwarding. Creating the integration alone does not start forwarding.

1. **Analyze them in your own system.** Use the receiving service or analytics tools to store, query, and visualize the delivered logs.

## What to consider\{#what-to-consider}

- **Log counts may be incomplete.** Sampling and dropped entries can leave gaps in the recorded activity. Account for these gaps when interpreting request counts and trends.

- **Returned results show only part of data access.** Counting returned entities tells you how often they appear in recorded results, not how often every entity was examined during request execution.

<Admonition type="info" title="Note">

Access logs and audit logs cannot be enabled together on a cluster. Slow logs are configured separately. If you only need to investigate requests that exceed a duration threshold, see [Slow Logs](./configure-slow-logs).

</Admonition>

## Billing\{#billing}

This feature is currently in public preview and is free of charge.

## Get started\{#get-started}

- [Configure Access Logs](./configure-access-logs) — Check prerequisites, set up forwarding, and verify that logs arrive.

- [Access Log Reference](./access-log-reference) — Look up log fields and their meanings.

