---
title: "Audit Logs | BYOC"
slug: /audit-logs
sidebar_label: "Audit Logs"
beta: FALSE
notebook: FALSE
description: "Audit logging allows administrators to track and monitor user-driven operations and API calls on Zilliz Cloud clusters. This feature provides a detailed record of vector db activities, including vector searches, query execution, index management, and other data operations. | BYOC"
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
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Audit Logs

Audit logging allows administrators to track and monitor user-driven operations and API calls on Zilliz Cloud clusters. This feature provides a detailed record of vector db activities, including vector searches, query execution, index management, and other data operations.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Audit logging is available only for clusters running on a <strong>Dedicated-Enterprise</strong> plan tier or higher. <a href="./manage-cluster">Upgrade your plan</a> if necessary.</p></li>
<li><p>Audit logging is supported only for Zilliz Cloud clusters running Milvus 2.5.x.</p></li>
<li><p>Audit logging can be forwarded to <a href="./integrate-with-aws-s3">AWS S3</a>, <a href="./integrate-with-azure-blob-storage">Azure Blob Storage</a>, or <a href="./integrate-with-gcp">Google Cloud Storage</a>.</p></li>
<li><p>Enabling audit logging incur charges. For details, see <a href="./audit-log-cost">Audit Log</a>.</p></li>
</ul>

</Admonition>

## Overview{#overview}

Audit logging tracks a wide range of operations on the data plane, including:

- **Search and Query Operations**: Vector searches, hybrid searches, and query operations.

- **Data Management**: Index creation, collection creation, partition management, and entity operations like insert, delete, and upsert.

- **System Events**: User access attempts, authorization checks, and other predefined actions.

<Admonition type="info" icon="📘" title="Notes">

<p>Cluster-level data jobs such as migration, backup, and restore do not generate audit logs. To view these activity records, refer to <a href="./view-activities">View Activities</a>.</p>

</Admonition>

Audit logs are forwarded directly to a user-designated object storage bucket at regular intervals. Logs are stored in a structured file path and naming format for easy access and management:

- **File Path**: `/<Cluster ID>/<Log type>/<Date>`

- **File Naming Convention**: `<File name><File name suffix>` in the format *HH:MM:SS-$UUID*, where *HH:MM:SS* represents the time in UTC and *$UUID* is a unique random string. Example: `09:16:53-jz5l7D8Q`.

Below are examples of audit log entries forwarded to a bucket:

- **Create Collection**

    ```json
    {
      "action": "CreateCollection",
      "cluster_id": "in01-0045a626277eafb",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit",
        "consistency_level": 2
      },
      "status": "Receive",
      "timestamp": 1742983070463,
      "trace_id": "216a8129c06fd3d93a47bd69fa0a65ad",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

- **Create Index**

    ```json
    {
      "action": "CreateIndex",
      "cluster_id": "in01-0045a626277eafb",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit"
      },
      "status": "Receive",
      "timestamp": 1742983070645,
      "trace_id": "4402e7bfc498dd06be1408c7e6a7954d",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

- **Drop Index**

    ```json
    {
      "action": "DropIndex",
      "cluster_id": "in01-0045a626277eafb",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit"
      },
      "status": "Receive",
      "timestamp": 1742983073378,
      "trace_id": "066ec33c3f55d3edbf7d01c6270024e2",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

Refer to the [Audit Log Reference](./audit-logs-ref) for a detailed list of supported actions and corresponding log fields.

## Enable audit log{#enable-audit-log}

Audit logging on Zilliz Cloud forwards audit logs directly to your storage bucket.

### Before you start{#before-you-start}

- You have **Organization Owner** or **Project Admin** access to the project. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

### Procedure{#procedure}

<Supademo id="cmei9fcd99br6h3pydbp52sv8" title="Zilliz Cloud - Enable audit log" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the left-side navigation pane, choose **Clusters**.

1. Go to the details page of the target cluster and choose the **Auditing** tab. This tab will be unavailable when your cluster is in **CREATING**,  **DELETING** or **DELETED** status.

1. Click **Enable Audit Log**.

1. In the **Enable Audit Logs** dialog box, specify your object storage integration settings.

    - **Storage Integration**: Select your bucket to store the audit logs.

        <Admonition type="info" icon="📘" title="Notes">

        <p>Only the buckets in the same region as your cluster will appear in the drop-down list.</p>

        </Admonition>

    - **Forward Directory**: Specify a directory within the bucket to store audit logs.

1. Click **Enable**. Once the **Audit Log** status is **Active**, it has been enabled successfully. If the status is **Abnormal**, go to [FAQ](./audit-logs#faq) for troubleshooting.

Once configured, audit logs will be forwarded to your bucket at an interval of about 5 minutes. You can access your bucket to view or manage the logs as needed.

Once your audit logs are forwarded to your S3 bucket, you can integrate your S3 storage to visualization platforms for enhanced monitoring and analysis. For instance, if you want to use Snowflake to gain deeper insights, refer to [Automating Snowpipe for Amazon S3](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3).

To understand parameters in log entries, refer to [Audit Logs](./audit-logs-ref).

## Manage audit logs{#manage-audit-logs}

Once audit log is enabled, you can edit its configuration or disable it as needed.

![XyvNb9sf1oGSKox0XxWc2BFAnrg](/img/XyvNb9sf1oGSKox0XxWc2BFAnrg.png)

## FAQ{#faq}

This FAQ addresses common issues and questions related to audit logging on Zilliz Cloud. For further assistance, contact [Zilliz Cloud support](https://support.zilliz.com/hc/en-us).

- **What should I do if my Audit Log status is Abnormal?**

    An **Abnormal** status means Audit Log is experiencing an issue. Follow these steps to troubleshoot:

    1. **Verify your bucket:** Confirm that the configured storage bucket is set up correctly and that you have the necessary permissions.

    1. **Contact support:** If the issue persists, contact [Zilliz Cloud support](https://support.zilliz.com/hc/en-us) for further assistance.

- **Will an Abnormal cluster status affect the Audit Log service?**

    An abnormal cluster status indicates that the cluster may be experiencing issues, such as network connectivity problems or disruptions in Zilliz Cloud services. However, these issues do not impact the Audit Log service, which continues to function normally and forward logs as expected. If you encounter persistent problems, contact [Zilliz Cloud support](https://support.zilliz.com/hc/en-us).

