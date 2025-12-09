---
title: "Release Notes (Jan 27, 2025) | Cloud"
slug: /release-notes-2130
sidebar_label: "Release Notes (Jan 27, 2025)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud now supports Milvus 2.5 in Public Preview, introducing full-text search to complement its semantic search. Using the BM25 metric and sparse vectors for efficient storage and retrieval, this feature allows users to query text directly without conversion. The update also enhances BYOC deployments with Private Link for improved security, easier compliance, and simplified network configuration. Additionally, auto-deployment via AWS CloudFormation is now supported, and the handling of large-scale small-file imports is optimized for faster data ingestion. | Cloud"
type: origin
token: LRRVwYzxKioMiMk7cf6czQuhn7d
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection

---

import Admonition from '@theme/Admonition';


# Release Notes (Jan 27, 2025)

Zilliz Cloud now supports Milvus 2.5 in **Public Preview**, introducing full-text search to complement its semantic search. Using the BM25 metric and sparse vectors for efficient storage and retrieval, this feature allows users to query text directly without conversion. The update also enhances BYOC deployments with Private Link for improved security, easier compliance, and simplified network configuration. Additionally, auto-deployment via AWS CloudFormation is now supported, and the handling of large-scale small-file imports is optimized for faster data ingestion.

## Milvus Compatibility\{#milvus-compatibility}

This release is compatible with **Milvus v2.4.x**.

If you prefer to upgrade your clusters to **Public Preview**, **Milvus 2.5.x** features are available after the upgrade. You can click **Try Preview Features** on the **Cluster Details** page on the Zilliz Cloud console to learn more about the features in **Public Preview**.

![KkqKbUfwwomTRBxKSwTcVjv0nLf](https://zdoc-images.s3.us-west-2.amazonaws.com/kkqkbufwwomtrbxkswtcvjv0nlf.png "KkqKbUfwwomTRBxKSwTcVjv0nLf")

## Zilliz Cloud Now Supports Milvus 2.5 in Public Preview, Introducing Full-Text Search\{#zilliz-cloud-now-supports-milvus-25-in-public-preview-introducing-full-text-search}

Zilliz Cloud is now compatible with Milvus 2.5, available as a **Public Preview**. This update introduces a major new feature: **full-text search**, also known as lexical or keyword search. If you're new to search, full-text search allows you to find documents by looking for specific words or phrases within them—similar to how you search on Google. This complements our existing **semantic search** capabilities, which focus on understanding meaning rather than just matching exact words.

Our implementation uses the **industry-standard BM25** metric for document similarity and is based on **sparse vectors**, enabling efficient storage and retrieval. In simple terms, sparse vectors represent text in a way where most values are zero—imagine a massive spreadsheet where only a few cells contain numbers, while the rest are empty. This efficiency aligns with Milvus’s core philosophy, where vectors serve as the foundation of search.

A key advantage of our approach is that you can **insert and query text directly, without needing to manually convert it into sparse vectors beforehand.** This brings Zilliz Cloud another step closer to fully supporting unstructured data processing.

For more details, refer to [Full Text Search](./full-text-search).

## BYOC - Enhanced Security and Simplified Deployment\{#byoc-enhanced-security-and-simplified-deployment}

With this release, **Zilliz Cloud now supports data plane–control plane communication via Private Link**, providing **stronger security and easier compliance** for BYOC deployments.

- **Stronger Security**: Private Link ensures that all communication between the control plane (hosted in Zilliz Cloud) and the data plane (deployed in your VPC) stays **within a private network**, completely bypassing the public internet. This **reduces exposure to cyber threats** and **eliminates the risk of data interception**.

- **Easier Compliance**: Many enterprises require **strict data residency and network isolation** to meet regulatory standards. With Private Link, you can ensure that **sensitive data never leaves your private environment**, making it easier to comply with **GDPR, HIPAA, and other security frameworks**.

- **Simplified Network Configuration**: Private Link removes the need for **complex firewall rules, VPNs, or public endpoints**, reducing operational overhead and making BYOC deployment **more straightforward and manageable**.

In addition, **Zilliz Cloud BYOC now supports auto-deployment via AWS CloudFormation**, making it even easier to set up and manage your data plane.

For more details, refer to [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws).

## Enhancements\{#enhancements}

**Support for Large-Scale Small File Imports**: Improved handling of imports involving numerous small files, ensuring faster and more efficient data ingestion.