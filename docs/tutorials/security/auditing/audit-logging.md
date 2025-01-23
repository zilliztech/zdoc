---
title: "Audit Logging | Cloud"
slug: /audit-logging
sidebar_label: "Audit Logging"
beta: PRIVATE
notebook: FALSE
description: "Audit logging allows administrators to track and monitor user-driven operations and API calls on Zilliz Cloud clusters. This feature provides a detailed record of data plane activities, including vector searches, query execution, index management, and other data operations. It provides visibility into how data is accessed and managed for security reviews, compliance audits, and issue resolution. | Cloud"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - auditing
  - log
  - configure
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';


# Audit Logging

Audit logging allows administrators to track and monitor user-driven operations and API calls on Zilliz Cloud clusters. This feature provides a detailed record of **data plane** activities, including vector searches, query execution, index management, and other data operations. It provides visibility into how data is accessed and managed for security reviews, compliance audits, and issue resolution.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Audit logging is in <strong>Private Preview</strong>. To request access to this feature or learn about associated costs, contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p></li>
<li><p>Audit logging does not support attributing API key connections to specific users. To achieve user-specific auditing, consider using a cluster user for authentication. Support for API key user attribution is planned for future releases.</p></li>
</ul>

</Admonition>

## Overview{#overview}

Audit logging tracks a wide range of operations on the data plane, including:

- **Search and Query Operations**: Vector searches, hybrid searches, and query operations.

- **Data Management**: Index creation, collection creation, partition management, and entity operations like insert, delete, and upsert.

- **System Events**: User access attempts, authorization checks, and other predefined actions.

<Admonition type="info" icon="📘" title="Notes">

<p>Cluster-level operations on the control plane such as migration, backup, and restore do not generate audit logs. To view these activity records, refer to <a href="./view-activities">View Activities</a>.</p>

</Admonition>

Audit logs are streamed directly to a user-designated object storage bucket at regular intervals. Logs are stored in a structured file path and naming format for easy access and management:

- **File Path**: `/<Cluster ID>/<Log type>/<Date>`

- **File Naming Convention**: `\<File name><File name suffix>`

Below is an example of an audit log entry streamed to a bucket:

```json
{
    "date": "2025-01-21T08:45:56.556286Z",
    "action": "CreateAlias",
    "cluster_id": "in01-b5a7e190615ef9f",
    "database": "database2",
    "interface": "Restful",
    "log_type": "AUDIT",
    "params": {
        "collection": "collection1"
    },
    "status": "Receive",
    "time": 1737449156556,
    "trace_id": "b599063b9d0cfcf9d756ddbbef56ab5b",
    "user": "zcloud_apikey_admin"
}
```

Refer to the [Audit Log Reference](./audit-logs-ref) for a detailed list of supported actions and corresponding log fields.

## Enable audit log streaming{#enable-audit-log-streaming}

Audit logging on Zilliz Cloud streams audit logs directly to your storage bucket.

### Before you start{#before-you-start}

- Your Zilliz Cloud cluster runs on a **Dedicated-Enterprise** plan tier or higher. [Upgrade your plan](./manage-cluster) if necessary.

- You have integrated your Zilliz Cloud project with object storage, as audit logs will be streamed to your bucket after configuration. For detailed steps, refer to [Integrate with AWS S3](./integrate-with-aws-s3).

- You have **Organization Owner** or **Project Admin** access to the project. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

### Procedure{#procedure}

![configure-auditing-1](/img/configure-auditing-1.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the left-side navigation pane, choose **Clusters**.

1. Go to the details page of the target cluster and choose the **Auditing** tab. This tab will be unavailable when your cluster is in **CREATING**,  **DELETING** or **DELETED** status.

1. Click **Enable Audit Log Streaming**.

1. In the **Enable Audit Log Streaming** dialog box, specify your object storage integration settings.

    - **Integration**: Displays the cloud provider that hosts your object storage.

    - **Integration Configuration**: Select your bucket to store the audit logs.

        <Admonition type="info" icon="📘" title="Notes">

        <p>Only the buckets in the same region as your cluster will appear in the drop-down list.</p>

        </Admonition>

    - **Export Directory**: Specify a directory within the bucket to store audit logs.

1. Click **Enable**. Once the **Audit Log Streaming** status is **Active**, it has been enabled successfully. If the status is **Abnormal**, go to [FAQ](./audit-logging) for troubleshooting.

Once configured, audit logs will be streamed to your bucket at an interval of about 5 minutes. You can access your bucket to view or manage the logs as needed.

To understand parameters in log entries, refer to [Audit Logs](./audit-logs-ref).

## Manage audit log streaming{#manage-audit-log-streaming}

Once audit log streaming is enabled, you can edit its configuration or disable it as needed.

![configure-auditing-2](/img/configure-auditing-2.png)

## FAQ{#faq}

This FAQ addresses common issues and questions related to audit logging on Zilliz Cloud. For further assistance, contact [Zilliz Cloud support](https://zilliz.com/contact-sales).

- **Why can’t I find the Auditing tab on my cluster’s details page?**

    The **Auditing** tab is currently only available to users who have been added to the whitelist as part of **Private Preview**. If you would like to access this feature, contact [Zilliz Cloud support](https://zilliz.com/contact-sales).

- **What should I do if my Audit Log Streaming status is Abnormal?**

    An **Abnormal** status means Audit Log Streaming is experiencing an issue. Follow these steps to troubleshoot:

    1. **Check connectivity**: Ensure the network connection is stable and no firewalls or VPN settings are blocking access to Zilliz Cloud.

    1. **Verify your bucket:** Confirm that the configured storage bucket is set up correctly and that you have the necessary permissions.

    1. **Contact support:** If the issue persists, contact [Zilliz Cloud support](https://zilliz.com/contact-sales) for further assistance.

- **Will an Abnormal cluster status affect the Audit Log Streaming service?**

    An abnormal cluster status indicates that the cluster may be experiencing issues, such as network connectivity problems or disruptions in Zilliz Cloud services. However, these issues do not impact the Audit Log Streaming service, which continues to function normally and stream logs as expected. If you encounter persistent problems, contact [Zilliz Cloud support](https://zilliz.com/contact-sales).

