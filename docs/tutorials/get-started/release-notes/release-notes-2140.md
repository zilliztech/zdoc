---
title: "Release Notes (Mar. 27, 2025) | Cloud"
slug: /release-notes-2140
sidebar_label: "Release Notes (Mar. 27, 2025)"
beta: FALSE
notebook: FALSE
description: "This release introduces two new features in PRIVATE PREVIEW a new BYOC deployment option called BYOC-I and a data plane audit logging feature. The former is designed to ensure complete data sovereignty without any cross-account IAM authorization, while the latter aims to enhance data security by providing detailed logs of actions performed on the data plane. In addition to launching these features, Zilliz Cloud has also revised its credit strategies. | Cloud"
type: origin
token: FSUqwEEIii9k2sklkcLcIFJJnbf
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


# Release Notes (Mar. 27, 2025)

This release introduces two new features in **PRIVATE PREVIEW**: a new BYOC deployment option called BYOC-I and a data plane audit logging feature. The former is designed to ensure complete data sovereignty without any cross-account IAM authorization, while the latter aims to enhance data security by providing detailed logs of actions performed on the data plane. In addition to launching these features, Zilliz Cloud has also revised its credit strategies.

## Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus v2.4.x**.

If you prefer to upgrade your clusters to **Public Preview**, **Milvus 2.5.x** features are available after the upgrade. You can click **Try Preview Features** on the **Cluster Details** page on the Zilliz Cloud console to learn more about the features in **Public Preview**.

![Koy0bfMhuoaJ2ZxtVJfcUSl9n6d](/img/Koy0bfMhuoaJ2ZxtVJfcUSl9n6d.png)

## BYOC-I: A New Deployment Option That Provides Complete Data Sovereignty with Enhanced Project Management Capabilities{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

With the addition of BYOC-I, Zilliz BYOC now provides two deployment options, namely the standard **BYOC** and **BYOC-I**. 

Unlike the standard BYOC, which requires cross-account authorization, BYOC-I employs an agent deployed in the customer-managed VPC as the single point of contact between the control panel in Zilliz's VPC and the data plane in the customer-managed VPC.

Zilliz BYOC supports data governance and compliance across industries like finance, healthcare, resources, education, and e-commerce, all of which face stringent compliance requirements. For enterprises and organizations that require more stringent regulatory measures, BYOC-I is an ideal deployment option for achieving complete data sovereignty.

This release also improves the management of projects deployed using the standard BYOC deployment option by adding **Suspend** and **Resume** functionalities. You can choose to pause the data plane and release the EC2 instances associated with the EKS cluster to lower infrastructure costs and restore the data plane whenever you see fit.

In this release, Zilliz BYOC is generally available. [Contact us](https://support.zilliz.com/hc/en-us) to learn about the pricing or request this feature if you are interested. 

For details about Zilliz BYOC deployment options, refer to [BYOC Overview](/docs/byoc/byoc-intro). For the deployment procedures and the enhanced project management capabilities, refer to [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) and [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws). 

## Data Plane Audit Logs: Protect Your Data Operations with Comprehensive Action Logs for Auditing{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

Audit logging enables administrators to monitor and track user-driven operations and API calls on Zilliz Cloud clusters. This feature offers a comprehensive record of **Data Plane** activities, such as vector searches, query execution, index management, and various data manipulation operations. It also provides insights and visibility into how data is accessed and managed for security audits, compliance reviews, and issue resolution.

Once you enable this feature, Zilliz Cloud will stream the audit logs to your designated object storage bucket. You can then use third-party data warehouse services like Snowflake for audit analysis, enhancing regulatory compliance, data security, and operational monitoring in your cluster.

This feature is now in **PRIVATE PREVIEW**. [Contact us](https://support.zilliz.com/hc/en-us) to learn about pricing or request this feature if you are interested.

For details about the procedure to enable audit logging in your clusters, refer to [Audit Logging](./audit-logs). To gain deeper insights into the collected audit logs using third-party data warehouse services like Snowflake, refer to [Automating Snowpipe for Amazon S3](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3). 

Zilliz Cloud now supports logging over 70 types of actions and events related to Collections, Databases, Entities (Search, HybridSearch, Insert, Upsert, Delete), Indexes, Partitions, and Aliases. More events will be included in future releases. For details on applicable actions and events, refer to [Audit Log Reference](./audit-logs-ref).

## Other Enhancements{#other-enhancements}

Since this release, Zilliz Cloud has adjusted its credit strategies. For details on the new credit strategies, refer to [Try Zilliz Cloud For Free](./free-trials).

