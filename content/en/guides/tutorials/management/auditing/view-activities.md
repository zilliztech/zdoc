---
title: "Platform Audit Logs | Cloud"
slug: /view-activities
sidebar_label: "Platform Audit Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Platform audit logs record administrative operations on your Zilliz Cloud resources and organization settings, such as creating, resuming, or deleting a cluster, managing organization users, and configuring integrations. Each log identifies the operation, when it occurred, and the user or system that performed it. Use these records to investigate changes and review administrative activity. | Cloud"
type: origin
token: PynkwpI6Qi7zL9kiTBfchREknOc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Platform Audit Logs

Platform audit logs record administrative operations on your Zilliz Cloud resources and organization settings, such as creating, resuming, or deleting a cluster, managing organization users, and configuring integrations. Each log identifies the operation, when it occurred, and the user or system that performed it. Use these records to investigate changes and review administrative activity.

This guide shows you how to:

- [View logs](./view-activities#view-platform-audit-logs) to find an operation and identify who performed it.

- [Download logs](./view-activities#download-platform-audit-logs) to share records for an audit or analyze them outside the console.

- [Forward logs](./view-activities#forward-platform-audit-logs) to your own storage or receiving service for ongoing archiving and analysis.

## View platform audit logs\{#view-platform-audit-logs}

![C2GJw1dXnhIQ5RbnINocJfAhnhh](https://zdoc-images.s3.us-west-2.amazonaws.com/C2GJw1dXnhIQ5RbnINocJfAhnhh.png)

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login), select your organization, and click **Platform Audit Logs** in the organization navigation.

1. Use the following filters to narrow the list. Click **Reset** to restore the default filters.

    | Filter | How to use it |
    | --- | --- |
    | All Levels | Select **Info**, **Warning**, or **Error**, or keep all levels. |
    | All Services | Select a category, such as **Cluster**, **User**, or **Integration**. |
    | Date range | Select the start and end dates, then click **Apply**. Each query can cover up to 90 × 24 hours. |

1. Review the matching records. Each record contains the following fields:

    | Field | Description |
    | --- | --- |
    | Level | **Info**: informational events. **Warning**: events requiring attention, such as cluster deletion. **Error**: reported failures. |
    | Service | The service or resource category associated with the event. |
    | Message | The operation and affected resource. |
    | Occurred At | When the event occurred. |
    | Actor | The user or system that performed the operation. |

</Procedures>

## Download platform audit logs\{#download-platform-audit-logs}

To review logs offline or share them with others, download the records as CSV or JSON Lines.

<Procedures>

1. On your organization's **Platform Audit Logs** page, select the filters for the records you need.

1. Click **Download** and choose **CSV (.csv)** for spreadsheet review or **JSON (.jsonl)** for programmatic processing, with one JSON record per line.

</Procedures>

The download includes all matching records across pages, up to **100,000 records**. Narrow the filters if the result exceeds this limit.

## Forward platform audit logs\{#forward-platform-audit-logs}

Enable automatic forwarding when you need an ongoing copy of administrative activity in your own storage or log-processing system. Zilliz Cloud sends logs from the entire organization to one destination. You configure the destination once, and new logs are forwarded as they become available.

### Before you start\{#before-you-start}

- You must be an **Organization Owner** with permission to use the destination integration. An integration stores the connection and access settings Zilliz Cloud needs to send logs to your destination.

- Have one of the following integrations ready in a project within the same organization. If it has not been created, open the project's **Integrations** page and follow the guide for your destination:

    - **Object storage:** Use a bucket or container to keep log files for archiving or later processing. Create an [Amazon S3](./integrate-with-aws-s3), [Google Cloud Storage](./integrate-with-gcp), or [Azure Blob Storage](./integrate-with-azure-blob-storage) integration with the access required to write logs.

    - **HTTPS endpoint:** Use a receiving service to ingest logs into your processing system. Prepare the service's HTTPS URL and authentication details, then follow [Integrate with an HTTPS Endpoint](./integrate-with-https-endpoint). Creating the integration connects Zilliz Cloud to an existing receiver; it does not create that service or start forwarding.

### Configure forwarding\{#configure-forwarding}

The following demo shows the configuration using an Amazon S3 integration.

<Procedures>

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), navigate to your organization's **Platform Audit Logs** page, then click **Turn On** in the **Auto-forward** card.

1. In **Send To**, select the integration you prepared under its project. Forwarding includes the entire organization's platform audit logs; project selection and log-list filters do not limit this scope.

1. For object storage, optionally enter a **Forward Directory**, such as **platform-audit/**. The path is relative to the bucket or container and must end with **/** without starting with **/**. Leave it empty if you do not need an additional directory. This field does not apply to HTTPS endpoints.

1. Select the **Format** your receiving system or processing tool expects:

    - **JSON**: For archiving or custom processing.

    - **ECS**: For pipelines that expect Elastic Common Schema fields.

    - **OTel**: For pipelines that expect the OpenTelemetry log format.

1. To include retained historical logs that have not been successfully delivered, select **Also send all undelivered past logs**. Leave it unselected to forward only new logs. The log-list date filter does not limit the history included.

1. Review your settings and click **Start Forwarding**. The **Auto-forward** card shows the destination and delivery progress.

</Procedures>

### Confirm that logs arrive\{#confirm-that-logs-arrive}

<Procedures>

1. Check delivery progress on the **Auto-forward** card: **Last delivered**, **Sent today**, and **Waiting to send**.

1. Find a recent event in the console and look for the same message and occurrence time at the destination. If you excluded historical logs, choose an event that occurred after forwarding started.

    - **Object storage:** Open the configured bucket or container and directory, then inspect the delivered files.

    - **HTTPS endpoint:** Check the records saved or indexed by your receiving system.

1. Confirm that your processing tool can read the record in the selected format.

</Procedures>

### Stop forwarding\{#stop-forwarding}

Stop forwarding when you no longer want to send organization logs to the configured destination.

<Procedures>

1. Review the destination and **Waiting to send** count on the **Auto-forward** card. If you need records at the destination before stopping, confirm their receipt first.

1. Click **Turn Off** when you are ready to stop. This button immediately submits the stop request; there is no confirmation dialog.

1. Wait for the **Auto-forward** status to change to **Off**. While the request is being processed, the page displays **Stopping forwarding**.

</Procedures>

You can continue to view and download available platform audit logs in the console.

## FAQ\{#faq}

- **Why can’t I find a forwarded log at the destination?**

    Check the following:

    - **Event and destination:** Confirm that you are checking the configured destination. If you did not include historical logs, look for an event that occurred after forwarding started.

    - **Delivery status:** Check the **Auto-forward** card for errors or logs waiting to be sent. Use any reported error to guide your checks.

    - **Destination access:** For object storage, check the configured directory and the integration’s write permissions. For HTTPS, check the receiver’s availability, authentication, certificates, and handling of the selected format.

- **Does a successful connection test mean logs are being delivered?**

    No. After you enable forwarding, check the destination for a real platform audit log. A successful connection test alone does not confirm that the receiving system has saved or processed that log.