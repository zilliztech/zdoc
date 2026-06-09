---
title: "Configure Access Logs | BYOC"
slug: /configure-access-logs
sidebar_label: "Configure Access Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide covers the full lifecycle of access logs on Zilliz Cloud enabling, adjusting settings, and disabling. | BYOC"
type: origin
token: QPgEwd4qziOa5RkgJR2c9gpnn3b
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Configure Access Logs

This guide covers the full lifecycle of access logs on Zilliz Cloud: enabling, adjusting settings, and disabling.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>This release logs search- or query-class actions only: Search, HybridSearch, and Query. Support for the full action list is planned for a future release.</p></li>
<li><p>Audit log and access log are mutually exclusive in this release — only one can be enabled at a time.</p></li>
<li><p>Access logs are available only for <strong>Dedicated</strong> clusters on <strong>Enterprise</strong> projects. If your cluster is on a different plan or cluster type, consider upgrading it.</p></li>
</ul>

</Admonition>

## Before you start\{#before-you-start}

- An object storage integration (AWS S3, Google Cloud Storage, or Azure Blob Storage) configured in the same region as your target cluster.

- **Organization Owner**, **Project Admin**, or **Cluster Admin** permissions for the project. If you do not have the required permissions, contact your Zilliz Cloud administrator.

## Enable access logs\{#enable-access-logs}

<Supademo id="cmn5r1yif3u0fz3qmiev350yz" title=""  />

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your target cluster.

1. On the cluster configuration page, click the **Access Log** tab, then click **Enable**.

1. In the **Access Log Settings** dialog box, configure the following settings:

    - **Storage Integration**: Select the integrated storage bucket where log files will be delivered.

    - **Directory**: Specify a directory within the bucket to store access logs.

    - **Sampling Rate**: Set the percentage of queries to log. A rate of 100% captures every operation. For high-volume workloads, a lower rate (such as 1%) reduces storage costs while preserving statistical significance.

    - **Actions**: Specify which operation types (for example, Search or HybridSearch) are recorded as access log entries.

    - **Output Fields**: Specify which metadata fields are included in each access log entry written to your object storage. Fields marked as **Always included** are recorded for every entry, while the selected fields are additionally captured.

1. Click **Save**. Log files begin appearing in your bucket within minutes, following the path convention `/<Cluster ID>/Access/<Date>/<HH:MM:SS>-<UUID>.log`.

</Procedures>

## Edit access log settings\{#edit-access-log-settings}

You can adjust the sampling rate and output fields at any time without disabling access logs.

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your cluster.

1. On the cluster configuration page, click the **Access Log** tab.

1. Click **Edit**.

1. Adjust the **Sampling Rate** or **Output Fields** as needed.

1. Click **Save**. The updated settings take effect immediately for new log entries. Existing log files in your bucket are not affected.

</Procedures>

## Disable access logs\{#disable-access-logs}

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your cluster.

1. On the cluster configuration page, click the **Access Log** tab.

1. Click **Disable**. New log entries stop immediately. Existing log files remain in your bucket. Billing for Access Logs stops once disabled.

</Procedures>