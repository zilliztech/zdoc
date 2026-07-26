---
title: "Configure Slow Logs | Cloud"
slug: /configure-slow-logs
sidebar_label: "Configure Slow Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide covers the full lifecycle of slow logs on Zilliz Cloud enabling, adjusting settings, and disabling. | Cloud"
type: origin
token: VcI1wZ5mQiGqdPkCzHccj1RLnbd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Configure Slow Logs

This guide covers the full lifecycle of slow logs on Zilliz Cloud: enabling, adjusting settings, and disabling.

<Admonition type="info" icon="📘" title="Notes">

- This release logs slow Search, HybridSearch, and Query requests.

- Slow logs are available only for **Dedicated** clusters on **Enterprise** projects. If your cluster is on a different plan or cluster type, consider upgrading it.

- The Slow logs feature is free of charge.

</Admonition>

## Before you start\{#before-you-start}

- An object storage integration (AWS S3, Google Cloud Storage, or Azure Blob Storage) configured in the same region as your target cluster. For setup instructions, refer to [Integrate with AWS S3](./integrate-with-aws-s3), [Integrate with Google Cloud Storage](./integrate-with-gcp), or [Integrate with Azure Blob Storage](./integrate-with-azure-blob-storage).

- **Organization Owner**, **Project Admin**, or **Cluster Admin** permissions for the project. If you do not have the required permissions, contact your Zilliz Cloud administrator.

## Enable slow logs\{#enable-slow-logs}

<Supademo id="cmqhjlq7g139qqmz3vhol6saa" title=""  />

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your target cluster.

1. Click the **Logs** tab.

1. Click on the **Configure** button on the **Slow Logs** card.

1. In the Slow **Log Settings** dialog box, configure the following settings:

    - **Storage Integration**: Select the integrated storage bucket where log files will be delivered.

    - **Directory**: Specify a directory within the bucket to store access logs.

    - **Threshold**: Specify the threshold for slow log collection. Operations whose execution time exceeds this value are recorded in slow logs. The default value is 150 ms.

1. Click **Save**.

</Procedures>

## Edit slow log settings\{#edit-slow-log-settings}

![Pj70wvma3hwRdubQdqucq7Zinnc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Pj70wvma3hwRdubQdqucq7Zinnc.png)

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your cluster.

1. Click the **Logs** tab.

1. Click **Edit**.

1. Adjust the **Storage Integration**, **Directory**, or **Threshold** as needed.

1. Click **Save**. The updated settings take effect immediately for new log entries. Existing log files in your bucket are not affected.

</Procedures>

## Disable slow logs\{#disable-slow-logs}

![AfQswQaVYh9qW7ba3sTcBI7qnfg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AfQswQaVYh9qW7ba3sTcBI7qnfg.png)

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your cluster.

1. Click the **Logs** tab.

1. Click **Disable**. New log entries stop immediately. Existing log files remain in your bucket.

</Procedures>