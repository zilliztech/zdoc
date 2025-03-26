---
title: "Release Notes (April 3, 2024) | Cloud"
slug: /release-notes-270
sidebar_label: "Release Notes (April 3, 2024)"
beta: FALSE
notebook: FALSE
description: "This update introduces powerful tools and enhancements to Zilliz Cloud new Connectors for easy data ingestion from sources like Object Storage, Rerankers to improve search relevance, a Metrics Monitoring API for in-depth system state analytics, and a Cross Cloud Data Import feature allowing direct import from AWS S3, Google Cloud Storage, and Azure Blob Storage to vector database instances. These features combine to elevate data ingestion, search precision, and operational insight, streamlining the management of vector databases in the cloud. | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# Release Notes (April 3, 2024)

This update introduces powerful tools and enhancements to Zilliz Cloud: new Connectors for easy data ingestion from sources like Object Storage, Rerankers to improve search relevance, a Metrics Monitoring API for in-depth system state analytics, and a Cross Cloud Data Import feature allowing direct import from AWS S3, Google Cloud Storage, and Azure Blob Storage to vector database instances. These features combine to elevate data ingestion, search precision, and operational insight, streamlining the management of vector databases in the cloud.

### Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.3.x**.

### Azure Marketplace{#azure-marketplace}

Zilliz Cloud is now available on the Azure Marketplace, making it simpler than ever for users to access our advanced, fully-managed vector database services on Azure. This new integration arrives at a crucial time as the need for scalable AI applications continues to rise. With Zilliz Cloud now on Azure Marketplace, users have the ability to swiftly build and expand their AI applications with ease. Embrace the power of Zilliz Cloud on Azure to accelerate your AI projects today. See [Zilliz Cloud on Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice).

### Connectors{#connectors}

Connectors are built-in tools designed for streaming data into Zilliz Cloud from multiple data sources, encompassing Object Storage, Kafka (with support arriving shortly), and beyond. For instance, the Object Storage connector has the capability to monitor a given object storage bucket, and automatically synchronize files like PDFs and HTMLs to Zilliz Cloud Ingestion Pipelines. This process facilitates the conversion of these files into vector representations, allowing them to be efficiently loaded in our vector database for enhanced search capabilities. For details, see [Connect to Your Data](./connectors).

### Rerankers{#rerankers}

Rerankers have now been integrated into the Search Pipeline, offering an optional enhancement for those seeking to refine their search results by relevance, thereby elevating search quality. In this release, we're introducing the following reranker option:

- zilliz/bge-reranker-base

[Discover more about the capabilities and advantages of rerankers](./reranker).

### API for Metrics Monitoring{#api-for-metrics-monitoring}

From this release, Zilliz Cloud provides an API dedicated to metrics monitoring. This newly introduced API grants access to a comprehensive suite of over 30 metrics, offering a holistic view of various aspects critical to your system's performance and efficiency.

Key Metrics Cover:

- Resource Utilization Tracking: Gain deep insights into Compute Unit (CU) resource utilization, allowing you to track compute utilization and storage capacity.

- Search and Data Insert Performance Metrics: Evaluate the performance of search queries and data insertion processes, with a special focus on latency and throughput.

- Request Failure Rate: Monitor the failure rates of requests to quickly identify and troubleshoot potential issues, ensuring reliable application performance.

- Collection and Entity Statistics: Access detailed statistics on collections and entities, facilitating improved data management.

[Discover more about the API details](/reference/restful/query-metrics).

### Cross Cloud Data Import and Migration Enhancement{#cross-cloud-data-import-and-migration-enhancement}

Now, Zilliz Cloud users can effortlessly import or migrate their data from AWS S3, Google Cloud Storage, and Azure Blob Storage into any vector database instance on Zilliz Cloud, regardless of where it resides.

For more details, see [Data Import](./data-import) and [Migrations](./migrations) in Zilliz Cloud docs.