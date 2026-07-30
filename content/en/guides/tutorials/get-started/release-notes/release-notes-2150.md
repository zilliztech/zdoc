---
title: "Release Notes (April 24, 2025) | Cloud"
slug: /release-notes-2150
sidebar_label: "April 24, 2025"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "We’re thrilled to share that Zilliz BYOC has introduced several enhancements, allowing you to configure instance settings for your BYOC project and enable AWS PrivateLink for your cluster. | Cloud"
type: origin
token: JPNiwF6rPiNe0pkx460cr321nTc
sidebar_position: 14
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# Release Notes (April 24, 2025)

We’re thrilled to share that Zilliz BYOC has introduced several enhancements, allowing you to configure instance settings for your BYOC project and enable AWS PrivateLink for your cluster.

## Milvus Compatibility\{#milvus-compatibility}

This release is compatible with **Milvus v2.5.x**.

- All Zilliz Cloud clusters created after this release are compatible with Milvus v2.5.x.

- For those clusters created before this release, you may need to click the yellow-squared button as shown in the following figure to try the functions and features of Milvus v2.5.x.

Currently, all Milvus v2.5.x features are still in **PUBLIC PREVIEW**.

![GeJSbANVto14OtxFg6zcPFAYnZz](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/gejsbanvto14otxfg6zcpfaynzz.png "GeJSbANVto14OtxFg6zcPFAYnZz")

## BYOC Enhanced with Instance Settings and AWS PrivateLink Support\{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

In Zilliz BYOC projects, services are organized into several groups, including **Search Services**, **Other Database Components**, and **Core Support Services**. With this release, you can now define the instance types and quantities for each service group during project creation.

To simplify configuration, Zilliz BYOC offers four predefined project sizes—**Small**, **Medium**, **Large**, and **X-Large**—so you can select the option that best fits your workload requirements.

This release also introduces the ability to enable or disable **AWS PrivateLink** for secure, private connectivity from your VPCs to the Zilliz Cloud Control Plane. Note that PrivateLink is enabled by default.

For details on the configuration procedures, refer to [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) and [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws).

## Fine-granular filtering within a JSON field\{#fine-granular-filtering-within-a-json-field}

Previously, JSON fields were not indexed, and all filter queries required scanning the entire JSON field in each entity. With this release, you can now create an inverted index on specific paths within a JSON field to accelerate queries.
To index a JSON field, set the index type to **INVERTED**, specify the JSON path you want to optimize, and cast its value to an appropriate data type. During metadata filtering, Zilliz Cloud scans only the specified path within each JSON field value, significantly reducing parsing time and improving filtering performance.

For details on how to index a JSON field and its considerations, refer to [JSON Indexing](./json-indexing).

## Other Enhancements\{#other-enhancements}

Added a new RESTful API endpoint for you to modify the replica count of your cluster. For details, refer to [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2).

