---
title: "Understand On-Demand Compute Usage | Cloud"
slug: /understand-on-demand-compute-usage
sidebar_label: "Understand Usage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "On-demand compute usage details help you understand the query and indexing compute usage included in an invoice. You can download usage details for an existing invoice as a CSV file and review them alongside the invoice. | Cloud"
type: origin
token: EOApwoWKPipHLHk7VKdci4QlnPc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Understand On-Demand Compute Usage

On-demand compute usage details help you understand the query and indexing compute usage included in an invoice. You can download usage details for an existing invoice as a CSV file and review them alongside the invoice.

## On-demand compute usage\{#on-demand-compute-usage}

On-demand compute includes two types of compute usage:

- **Query CU usage** measures the compute resources consumed by on-demand clusters while they are active.

- **Indexing CU usage** measures the compute resources consumed by index-building workloads for managed and external collections.

Usage details are expressed in CU-minutes. Charges depend on usage and applicable unit prices. For the cost calculation and billing rules, see [On-Demand Compute Cost](/docs/on-demand-compute-cost).

## Download usage details\{#download-usage-details}

![K0AXwjpuNhNvUQbnym4cDCFMnZb](https://zdoc-images.s3.us-west-2.amazonaws.com/K0AXwjpuNhNvUQbnym4cDCFMnZb.png)

<Procedures>

1. In the Zilliz Cloud console, open the invoice whose usage you want to inspect.

1. Select the option to download on-demand compute usage details.

1. Choose **Query CU** or **Indexing CU**, and download the CSV file.

</Procedures>

The file contains usage for the selected type and invoice. If there is no usage for that type, the CSV contains only column headers.

## Understand Query CU usage\{#understand-query-cu-usage}

The Query CU CSV contains one row for each billing interval.

| Field | Description |
| --- | --- |
| Invoice ID and invoice line item ID | Identify the invoice and the associated line item. |
| Period Start and Period End | Start and end of the invoice period, in UTC. The start is inclusive and the end is exclusive. |
| Region ID, Project ID, and Instance ID | Identify the region, project, and on-demand cluster associated with the usage. |
| Session ID | Identifies the billing interval. |
| Start Time and End Time | Start and end of the billing interval in UTC, recorded to second precision. |
| CU | Query CU capacity used for the billing interval. |
| Billable Minutes | Minutes billed for the interval. |
| CU-minutes | Query CU usage for the interval, calculated from CU and billable minutes. |
| Calculation | A description of how usage is calculated. |

Each billing interval is rounded up to a whole minute. Because the exported start and end times have second precision, a duration calculated from those timestamps may not reproduce the original billed minutes. Use the **Billable Minutes** and **CU-minutes** values in the export when reviewing the billed usage.

A billing session ID identifies a billing interval. It is different from the run ID used in the cluster monitoring view; do not assume a one-to-one mapping. A run groups requests associated with a compute activation, whereas the CSV reports billed usage. For run details, see [Monitor On-Demand Clusters](./monitor-on-demand-cluster).

## Understand Indexing CU usage\{#understand-indexing-cu-usage}

The Indexing CU CSV contains one row per collection within an invoice line item.

| Field | Description |
| --- | --- |
| Invoice ID and invoice line item ID | Identify the invoice and the associated line item. |
| Period Start and Period End | Start and end of the invoice period, in UTC. The start is inclusive and the end is exclusive. |
| Region ID, Project ID, and Instance ID | Identify the region, project, and compute instance associated with the usage. |
| Database ID and Database Name | Identify the database associated with the collection. |
| Collection ID and Collection Name | Identify the collection whose billed usage is aggregated in the row. |
| CU-minutes | Aggregated billed indexing usage for the collection. |
| Calculation | A description of how usage is calculated. |

The rows summarize billed collection usage; they do not represent individual indexing jobs. The invoice is the source of truth for charged amounts.

## Troubleshoot downloads\{#troubleshoot-downloads}

| Issue | What to do |
| --- | --- |
| Usage details are incomplete or do not match the invoice. | Retry after the invoice is updated, or contact support. A partial file is not provided. |
| Usage details exceed the download limit. | Contact support for a complete export. |
| Too many export requests are in progress. | Retry later. |
| The download fails because of a network, permission, or session issue. | Check your connection and access, then retry. |
