---
title: "Release Notes (Apr 24, 2025) | Cloud"
slug: /release-notes-2150
sidebar_label: "Release Notes (Apr 24, 2025)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "We’re thrilled to share that Zero-Downtime Migration is now available in Private Preview on Zilliz Cloud! Whether you need to upgrade your cluster or make a change to your deployment, such as switching from Capacity-optimized Compute Units (CU) to another option, you can effortlessly migrate your data without any service interruptions. Additionally, Zilliz BYOC has introduced several enhancements, allowing you to configure instance settings for your BYOC project and enable AWS PrivateLink for your cluster. | Cloud"
type: origin
token: JPNiwF6rPiNe0pkx460cr321nTc
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


# Release Notes (Apr 24, 2025)

We’re thrilled to share that Zero-Downtime Migration is now available in **Private Preview** on Zilliz Cloud! Whether you need to upgrade your cluster or make a change to your deployment, such as switching from Capacity-optimized Compute Units (CU) to another option, you can effortlessly migrate your data without any service interruptions. Additionally, Zilliz BYOC has introduced several enhancements, allowing you to configure instance settings for your BYOC project and enable AWS PrivateLink for your cluster.

## Milvus Compatibility\{#milvus-compatibility}

This release is compatible with **Milvus v2.5.x**.

- All Zilliz Cloud clusters created after this release are compatible with Milvus v2.5.x.

- For those clusters created before this release, you may need to click the yellow-squared button as shown in the following figure to try the functions and features of Milvus v2.5.x.

Currently, all Milvus v2.5.x features are still in **PUBLIC PREVIEW**.

![GeJSbANVto14OtxFg6zcPFAYnZz](https://zdoc-images.s3.us-west-2.amazonaws.com/gejsbanvto14otxfg6zcpfaynzz.png "GeJSbANVto14OtxFg6zcPFAYnZz")

## Seamless Data Migration with Minimal Service Interruption\{#seamless-data-migration-with-minimal-service-interruption}

In previous releases, migrating data between clusters required carefully planned downtime, an obstacle for businesses with strict availability requirements. With Zero-Downtime Migration, Zilliz Cloud now eliminates this complexity, delivering a seamless, fully managed migration experience.

This feature uses a dual-stack strategy combining two components: a backup tool and Change Data Capture (CDC). The backup tool captures a consistent snapshot of your source cluster, while CDC continuously tracks and replicates new writes to the target cluster in real time.

Zilliz Cloud’s native migration flow ensures:

- Consistency across historical data and real-time updates,

- Correct event ordering and robust fault tolerance,

- Protection against write conflicts, race conditions, and schema mismatches, and

- Smooth state transitions between the source and target clusters throughout the migration process.

Zero-Downtime Migration is now available in **Private Preview** on the Zilliz Cloud console. Log in to start your first migration—no downtime required. For detailed operating procedures and limits, refer to [Zero Downtime Migration](./zero-downtime-migration).

## BYOC Enhanced with Instance Settings and AWS PrivateLink Support\{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

In Zilliz BYOC projects, services are organized into several groups, including **Search Services**, **Other Database Components**, and **Core Support Services**. With this release, you can now define the instance types and quantities for each service group during project creation.

To simplify configuration, Zilliz BYOC offers four predefined project sizes—**Small**, **Medium**, **Large**, and **X-Large**—so you can select the option that best fits your workload requirements.

This release also introduces the ability to enable or disable **AWS PrivateLink** for secure, private connectivity from your VPCs to the Zilliz Cloud Control Plane. Note that PrivateLink is enabled by default.

For details on the configuration procedures, refer to [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) and [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws).

## Fine-granular filtering within a JSON field\{#fine-granular-filtering-within-a-json-field}

Previously, JSON fields were not indexed, and all filter queries required scanning the entire JSON field in each entity. With this release, you can now create an inverted index on specific paths within a JSON field to accelerate queries.
To index a JSON field, set the index type to **INVERTED**, specify the JSON path you want to optimize, and cast its value to an appropriate data type. During metadata filtering, Zilliz Cloud scans only the specified path within each JSON field value, significantly reducing parsing time and improving filtering performance.

For details on how to index a JSON field and its considerations, refer to [Index a JSON field](./use-json-fields).

## Other Enhancements\{#other-enhancements}

Added a new RESTful API endpoint for you to modify the replica count of your cluster. For details, refer to [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2).

