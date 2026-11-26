---
title: "Configure Slow Logs | Cloud"
slug: /configure-slow-logs
sidebar_label: "Configure Slow Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use slow logs to investigate Search, HybridSearch, and Query requests that take longer than expected. Set an execution-time threshold, then forward matching requests to object storage or an HTTPS service for analysis. | Cloud"
type: origin
token: QoEpwKGbEirQl1kh3W3c0zdinAd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Configure Slow Logs

Use slow logs to investigate Search, HybridSearch, and Query requests that take longer than expected. Set an execution-time threshold, then forward matching requests to object storage or an HTTPS service for analysis.

## Before you start\{#before-you-start}

- Use a running Dedicated cluster on an Enterprise plan or higher.

- Sign in as an **Organization Owner**, **Project Admin**, or **Cluster Admin** with access to the cluster.

- Prepare a destination integration in the **same project as the cluster**:

    - **To store logs in a bucket or container:** Set up an [Amazon S3](./integrate-with-aws-s3), [Google Cloud Storage](./integrate-with-gcp), or [Azure Blob Storage](./integrate-with-azure-blob-storage) integration for your cluster's region.

    - **To send logs to your logging system:** Prepare a service that receives logs over HTTPS and configure an [HTTPS Endpoint integration](./integrate-with-https-endpoint) with its URL and authentication settings.

Slow logging is configured independently of audit and access logging. You do not need to turn either off to configure slow logs. Creating an integration prepares the destination; the steps below enable forwarding from the cluster.

## Enable slow log forwarding\{#enable-slow-log-forwarding}

<Supademo id="cmwa5r4vs07nwqmfqs04zwdz3" title=""  />

<Procedures>

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), open your project and select the target cluster.

1. Open the **Logs** tab. In the **Slow Logs** card, click **Configure**.

1. In **Slow Logs Settings**, choose where to send the logs:

    - **Send To:** Select the integration you prepared in this project.

    - **Format:** Choose a format your receiving system can process: **JSON**, **ECS**, or **OTel** (OpenTelemetry).

    - **For object storage:** Specify the destination directory and check the path preview. HTTPS destinations do not use a directory.

1. Set **Slow Log Threshold (ms)** to the execution time above which you want to investigate requests. The default is **150 ms**. For example, with a threshold of 150 ms, a request that takes 200 ms qualifies for slow logging. A lower threshold captures more requests; a higher threshold focuses on longer-running requests.

1. Review the destination and threshold, then click **Start Forwarding**. Check the status in the Slow Logs card, then verify that a matching log reaches the destination.

</Procedures>

## Verify that logs arrive\{#verify-that-logs-arrive}

<Procedures>

1. After forwarding is active, identify a **Search**, **HybridSearch**, or **Query** request whose execution time exceeds the configured threshold. Note the operation time and target collection. A request below the threshold will not produce a slow log.

1. Look for the corresponding record at the destination:

    - **Object storage:** Open the configured bucket or container and directory, then inspect newly delivered log objects.

    - **HTTPS endpoint:** Check the receiving service's ingestion records or stored logs.

1. Compare the recorded operation and execution time with the request you are investigating. See [Slow Logs Reference](./slow-log-reference) for field definitions.

</Procedures>

A successful integration test does not verify delivery of a real slow log. If no request exceeds the threshold, the absence of slow logs alone does not indicate a forwarding failure.

## FAQ\{#faq}

- **Why is Configure unavailable?**

    Make sure the cluster is running and that your role, plan, and cluster type support slow logging. Slow logging is configured separately from audit and access logging.

- **Why can't I find my destination integration?**

    The integration must belong to the same project as the cluster. Check the project's **Integrations** page and create the integration there if needed.

- **Why haven't my slow logs arrived?**

    Check the forwarding status and any error in the console, then check the request and destination:

    - The request occurred after forwarding started, is a supported operation, and exceeds the configured threshold.

    - For object storage, check write permissions and look in the configured directory.

    - For HTTPS, check the receiver's availability, authentication settings, and ingestion errors.

- **Is the slow log feature free?**

    Yes, this feature is free of charge.