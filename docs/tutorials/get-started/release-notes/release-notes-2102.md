---
title: "Release Notes (Oct 14, 2024) | Cloud"
slug: /release-notes-2102
sidebar_label: "Release Notes (Oct 14, 2024)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This release of Zilliz Cloud introduces several key updates the Notebook Gallery, which provides examples on advanced features like RAG, embeddings, and multi-modal search; an Improved Capacity of Performance-optimized CU, now increased by 50%, accommodating up to 1.5 million 768-dim vectors per CU and potentially reducing costs by 30% for large data volumes; and Multi-replica Availability, enhancing query performance and reliability by distributing workloads and replicas across Availability Zones (AZs). Additionally, Zilliz Cloud now supports the AWS Tokyo Region for improved performance in the Asia-Pacific area, Prometheus Integration for real-time monitoring and troubleshooting, and a revamped Authentication and Login System with Auth0, offering multiple login methods including SSO. Lastly, users can evaluate Zilliz products through the AWS Marketplace Free Trial, providing risk-free access to core features for performance and scalability testing. | Cloud"
type: origin
token: PyrrwqrGbirtGTkh4oacaov7nHh
sidebar_position: 12
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - vector database
  - IVF
  - knn
  - Image Search

---

import Admonition from '@theme/Admonition';


# Release Notes (Oct 14, 2024)

This release of Zilliz Cloud introduces several key updates: the **Notebook Gallery**, which provides examples on advanced features like RAG, embeddings, and multi-modal search; an **Improved Capacity of Performance-optimized CU**, now increased by 50%, accommodating up to 1.5 million 768-dim vectors per CU and potentially reducing costs by 30% for large data volumes; and **Multi-replica Availability**, enhancing query performance and reliability by distributing workloads and replicas across Availability Zones (AZs). Additionally, Zilliz Cloud now supports the **AWS Tokyo Region** for improved performance in the Asia-Pacific area, **Prometheus Integration** for real-time monitoring and troubleshooting, and a revamped **Authentication and Login System with Auth0**, offering multiple login methods including SSO. Lastly, users can evaluate Zilliz products through the **AWS Marketplace Free Trial**, providing risk-free access to core features for performance and scalability testing.

### Milvus Compatibility\{#milvus-compatibility}

This release is compatible with **Milvus 2.4.x**.

### Notebook Gallery\{#notebook-gallery}

In this release, Zilliz Cloud introduces the Notebook Gallery. This gallery provides detailed examples showcasing advanced features of Zilliz Cloud. The notebooks cover a wide range of use cases, including but not limited to RAG (Retrieval-Augmented Generation), agents, embeddings, text search, multi-modal search, data ingestion, migration, performance optimization, and more.

Explore the [notebooks](https://zilliz.com/learn/milvus-notebooks) now!

### Improved Capacity of Performance-optimized CU\{#improved-capacity-of-performance-optimized-cu}

With this release, the capacity of the performance-optimized CU (Compute Unit) has been increased by 50%. Previously, each performance-optimized CU could hold approximately 1 million vectors when estimated with 768-dimension vectors. Now, the capacity has been enhanced to 1.5 million vectors per CU. For large data volumes, this improvement can reduce CU costs by approximately 30%.

### Multi-replica Generally Available\{#multi-replica-generally-available}

Multi-replica is now generally available in Zilliz Cloud, enabling cluster-level replication to boost both query throughput and availability.

- **Improved Query Performance**: For users requiring high query-per-second (QPS), multi-replica allows query workloads to be distributed across replicas. This parallel processing enhances overall throughput, reduces latency, and improves efficiency for query-intensive applications. In most cases, the overall QPS can be improved linearly as replicas are added.

- **Enhanced Availability**: Multi-replica strengthens availability by distributing replicas across multiple Availability Zones (AZs). This setup ensures continuous access to data, even in the event of an AZ outage, offering greater reliability for mission-critical applications.

- For details on configuring multi-replica, refer to our [Manage Replica](./manage-replica).

### New Region Available: AWS Tokyo\{#new-region-available-aws-tokyo}

Zilliz Cloud is now available in the AWS Tokyo region (ap-northeast-1), providing users in the Asia-Pacific region with improved latency and performance.

To view pricing details for the AWS Tokyo region, visit the [pricing page](https://zilliz.com/pricing).

### Prometheus Integration Support\{#prometheus-integration-support}

Zilliz Cloud now supports integration with Prometheus, allowing users to monitor and visualize system metrics in real time. This integration enables users to track performance, resource usage, and system health, ensuring proactive monitoring and efficient troubleshooting. For setup and configuration details, refer to [Integrate with Prometheus](./prometheus-monitoring).

### Authentication and Login System Refactoring with Auth0\{#authentication-and-login-system-refactoring-with-auth0}

In this release, Zilliz Cloud has revamped its authentication and login system using Auth0. Zilliz Cloud now supports three login methods: 

- Email registration and login.

- Quick login via GitHub or Google authentication.

- SSO login for enterprise customers. For more details, visit [Single Sign-on with Okta](./single-sign-on).

### AWS Marketplace Free Trial\{#aws-marketplace-free-trial}

With this release, Zilliz Cloud users can take advantage of the AWS Marketplace Free Trial option, providing an opportunity to explore and evaluate Zilliz products in a risk-free environment before committing to larger purchase decisions. This trial grants full access to the platform’s core features, allowing users to thoroughly test performance, scalability, and compatibility with their applications.

Get Zilliz services via [AWS Marketplace: Zilliz](https://aws.amazon.com/marketplace/seller-profile?id=4922a541-e428-480d-8e32-db4ee9a7f46e).