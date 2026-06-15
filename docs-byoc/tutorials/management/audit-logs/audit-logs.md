---
title: "VectorDB Audit Logs | BYOC"
slug: /audit-logs
sidebar_label: "VectorDB Audit Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Audit logging allows administrators to track and monitor user-driven operations and API calls on Zilliz Cloud clusters. This feature provides a detailed record of vector db activities, including vector searches, query execution, index management, and other data operations. | BYOC"
type: origin
token: M5dXwsGOOiPdAjkWLZUc2Pxonuh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB Audit Logs

Audit logging allows administrators to track and monitor user-driven operations and API calls on Zilliz Cloud clusters. This feature provides a detailed record of vector db activities, including vector searches, query execution, index management, and other data operations.

<Admonition type="info" icon="📘" title="Notes">

- Audit logging is available only for **Dedicated** clusters in **Enterprise** projects or higher plan tiers.

- Audit logging is supported only for Zilliz Cloud clusters running Milvus 2.5.x or later.

- In BYOC deployments, VDB audit logs are written directly to the log bucket configured in your data plane's local object storage (S3/Azure Blob Storage/GCS), ensuring no data leaves your infrastructure. To enable and configure audit logging, please [contact us](https://support.zilliz.com/hc/en-us).

</Admonition>

## Overview\{#overview}

Audit logging tracks a wide range of operations on the data plane, including:

- **Search and Query Operations**: Vector searches, hybrid searches, and query operations.

- **Data Management**: Index creation, collection creation, partition management, and entity operations like insert, delete, and upsert.

- **System Events**: User access attempts, authorization checks, and other predefined actions.

<Admonition type="info" icon="📘" title="Notes">

Cluster-level data jobs such as migration, backup, and restore do not generate audit logs. To view these activity records, refer to [View Activities](./view-activities).

</Admonition>

Audit logs are forwarded directly to a user-designated object storage bucket at regular intervals. Logs are stored in a structured file path and naming format for easy access and management:

- **File Path**: `/<Cluster ID>/<Log type>/<Date>`

- **File Naming Convention**: `<File name><File name suffix>` in the format *HH:MM:SS-&#36;UUID*, where *HH:MM:SS* represents the time in UTC and *&#36;UUID* is a unique random string. Example: `09:16:53-jz5l7D8Q`.

Below are examples of audit log entries forwarded to a bucket:

- **Create Collection**

    ```json
    {
      "action": "CreateCollection",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
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
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
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
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
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

<Admonition type="info" icon="📘" title="Notes">

Audit logging will be directly forwarded to the object storage bucket configured during the data plane deployment.

To export the logs to your logging system for further analysis, [contact us](https://support.zilliz.com/hc/en-us/requests/new).

</Admonition>

