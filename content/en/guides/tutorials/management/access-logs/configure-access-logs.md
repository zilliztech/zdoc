---
title: "Configure Access Logs | Cloud"
slug: /configure-access-logs
sidebar_label: "Configure Access Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use access logs to understand how applications search and query your data. Choose which operations and fields to record, then forward the logs to object storage or an HTTPS service for analysis. | Cloud"
type: origin
token: E2X9wUPLpi3pQxkJzBpcpZ4snHg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Configure Access Logs

Use access logs to understand how applications search and query your data. Choose which operations and fields to record, then forward the logs to object storage or an HTTPS service for analysis.

## Before you start\{#before-you-start}

- Use a running Dedicated cluster on the Enterprise plan or higher.

- Sign in as an **Organization Owner**, **Project Admin**, or **Cluster Admin** with access to the cluster.

- Make sure audit logging is not enabled on the cluster. Audit logs and access logs cannot be enabled at the same time; slow logging is configured separately.

- Prepare a destination integration in the **same project as the cluster**:

    | If you want to… | Prepare… |
    | --- | --- |
    | Store logs in a bucket or container | An [Amazon S3](./integrate-with-aws-s3), [Google Cloud Storage](./integrate-with-gcp), or [Azure Blob Storage](./integrate-with-azure-blob-storage) integration. |
    | Send logs to your logging system | A service that accepts logs over HTTPS and an [HTTPS Endpoint integration](./integrate-with-https-endpoint) with its URL and authentication settings. |

## Enable access log forwarding\{#enable-access-log-forwarding}

<Supademo id="cmwa4b8mn06pzqmfq90sv710t" title=""  />

<Procedures>

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), open your project and select the target cluster.

1. Open the **Logs** tab. In the **Access Logs** card, click **Configure**.

1. Choose where to send the logs in **Access Logs Settings**:

    - **Send To:** Select the integration you prepared in this project.

    - **Format:** Choose a format your receiving system can process from the available options: **JSON**, **ECS**, or **OTel** (OpenTelemetry).

    - **For object storage:** Configure the destination directory and check the path preview. HTTPS destinations do not use a directory.

1. Choose which requests to record:

    - **Operations:** Select **Search**, **HybridSearch**, and/or **Query** according to the traffic you want to analyze.

    - **Sample Rate:** Enter a value from **0 to 1**. Lower values reduce log volume; higher values capture more of the selected operations.

1. In **Output Fields**, select the information needed for your analysis. For example, include `execution_time` to examine request duration, `result_pks` to identify frequently returned entities, or `result_scores` to analyze search scores. The fields `cluster_id`, `log_type`, and `user` are always included. For field definitions and operation-specific availability, see [Access Log Reference](./access-log-reference).

1. Review your selections, then click **Start Forwarding**. Check the status in the Access Logs card, then verify that logs reach the destination.

</Procedures>

## Verify that logs arrive\{#verify-that-logs-arrive}

<Procedures>

1. After forwarding is active, perform an operation selected in **Operations** against a collection in this cluster. Note the operation time. At a low sample rate, a single request might not appear in the logs.

1. Find a matching record at the destination:

    - **Object storage:** Open the configured bucket or container and directory, then inspect a newly delivered log object.

    - **HTTPS endpoint:** Check the receiving service's ingestion records or stored logs for the operation.

</Procedures>

A successful integration test confirms acceptance of the test event. Check a real access log record to verify the cluster's forwarding configuration.

## FAQ\{#faq}

- **Why is Configure unavailable?**

    Make sure the cluster is running and that your role and plan support access logging. Check whether audit logging is enabled: audit logs and access logs cannot be enabled at the same time on a cluster.

- **Why can't I find my destination integration?**

    The integration must belong to the same project as the cluster. Check the project's Integrations page and create the integration there if needed.

- **Why haven't my access logs arrived?**

    Check the forwarding status and any error in the console, then verify the following:

    - The request occurred after forwarding started, and its operation is selected in **Operations**. At a low sample rate, a single request might not be recorded.

    - For object storage, check write permissions and look in the configured directory.

    - For HTTPS, check the receiver's availability, authentication settings, and ingestion errors.

