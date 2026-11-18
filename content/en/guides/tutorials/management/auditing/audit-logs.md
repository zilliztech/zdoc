---
title: "VectorDB Audit Logs | Cloud"
slug: /audit-logs
sidebar_label: "VectorDB Audit Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use VectorDB audit logs to investigate operations on your cluster, such as searches, queries, and changes to collections, indexes, and data. Forward these logs to object storage for retention or to an HTTPS endpoint for processing in your logging system. | Cloud"
type: origin
token: FrKYwyBXKiktPzkQcFXco2qUnYd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# VectorDB Audit Logs

Use VectorDB audit logs to investigate operations on your cluster, such as searches, queries, and changes to collections, indexes, and data. Forward these logs to object storage for retention or to an HTTPS endpoint for processing in your logging system.

For administrative activities such as cluster backups, restores, and migrations, see [Platform Audit Logs](./view-activities).

## Before you start\{#before-you-start}

- Use a Dedicated cluster on the Enterprise plan or higher.

- Sign in as an **Organization Owner** or **Project Admin**, and make sure the cluster is running so that you can manage its audit logging settings.

- Choose between audit logs and access logs: they cannot be enabled at the same time on a cluster. Slow logging is configured separately.

- Create a destination integration in the **same project as your cluster**. Choose the destination according to where you want to use the logs.

    | Destination | What to prepare |
    | --- | --- |
    | Object storage | A bucket or container for retaining logs, and its project integration. Follow [Amazon S3](./integrate-with-aws-s3), [Google Cloud Storage](./integrate-with-gcp), or [Azure Blob Storage](./integrate-with-azure-blob-storage) setup instructions. |
    | HTTPS endpoint | A service that accepts logs over HTTPS, and an integration with its URL and authentication settings. Follow [Integrate with an HTTPS Endpoint](./integrate-with-https-endpoint) to prepare the service and test the integration. |

<Admonition type="info" title="Notes">

For the existing BYOC audit logging setup, logs are written to the object storage configured for your data plane. [Contact support](https://support.zilliz.com/hc/en-us) to enable or configure audit logging.

</Admonition>

## Enable audit log forwarding\{#enable-audit-log-forwarding}

**Performance and cost:** Audit logging may affect query and write performance and incurs audit log CU costs. Review [Audit Logs Cost](./audit-log-cost) before enabling it.

<Procedures>

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), open your project and select the target cluster.

1. Open the **Logs** tab. In the **Audit Logs** card, click **Configure**.

1. In **Audit Logs Settings**, select a destination from **Send To** and configure the output.

    | Setting | What to choose |
    | --- | --- |
    | Send To | Select the integration you prepared in this project. For object storage, this identifies the bucket or container. For HTTPS, it identifies the receiving service. |
    | Format | Choose a format supported by your downstream parser or logging system from the available options: **JSON**, **ECS**, or **OTel** (OpenTelemetry). |
    | Forward directory<br/>(object storage only) | Choose where to store logs within the bucket or container. Check the path preview so that you know where to find this cluster's audit logs. HTTPS forwarding does not use a directory. |

1. Review the configuration, then click **Start Forwarding**.

1. Wait for the audit log status to become **Active**, then check that logs reach the destination.

</Procedures>

## Verify that logs arrive\{#verify-that-logs-arrive}

<Procedures>

1. After audit logging is active, perform a supported operation on the cluster, such as a query against an existing collection. Note the time of the operation.

1. Check the configured destination for a new log record from this cluster around that time.

    | Destination | Where to check |
    | --- | --- |
    | Object storage | Open the bucket or container and locate the directory shown in the configuration. Inspect a new log object and find the record for your operation. |
    | HTTPS endpoint | Check the receiving service's ingestion records or stored logs for the operation. A successful integration test does not replace checking delivery of real cluster logs. |

</Procedures>

For supported operations and field definitions, see [VectorDB Audit Logs Reference](./audit-logs-ref).

## FAQ\{#faq}

- **Why can't I open the audit log settings?**

    Check that the cluster is running and that you have the required role and plan. A suspended cluster displays **Auditing Unavailable** on its Logs tab.

- **What should I check if logs do not arrive?**

    Check the audit log status and any error shown in the console. Confirm that a supported operation occurred after logging became active. For object storage, check the configured directory and write permissions. For HTTPS, check the receiver's availability, authentication, and ingestion errors. If the issue persists, contact [support](https://support.zilliz.com/hc/en-us) with the cluster ID, time of the operation, and error message.