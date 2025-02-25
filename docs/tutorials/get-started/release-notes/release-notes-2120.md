---
title: "Release Notes (Dec 26, 2024) | Cloud"
slug: /release-notes-2120
sidebar_label: "Release Notes (Dec 26, 2024)"
beta: FALSE
notebook: FALSE
description: "With this release, Zilliz Cloud introduces significant enhancements to improve security, performance, and usability across its BYOC solution. A global mmap strategy is now implemented, offering customizable configurations at both the field and index levels, which enables increased collection capacity while maintaining search performance. Building on Milvus, Zilliz Cloud now supports database creation within clusters and provides collection-level Role-Based Access Control (RBAC) for better data management and multi-tenancy. Additionally, search precision settings have been refined, and these are now coupled with recall rate estimation capabilities to help optimize search accuracy and performance effectively. | Cloud"
type: origin
token: OJVrwOiE4i3fFjk2J3NcneLznfh
sidebar_position: 2
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


# Release Notes (Dec 26, 2024)

With this release, Zilliz Cloud introduces significant enhancements to improve security, performance, and usability across its BYOC solution. A global mmap strategy is now implemented, offering customizable configurations at both the field and index levels, which enables increased collection capacity while maintaining search performance. Building on Milvus, Zilliz Cloud now supports database creation within clusters and provides collection-level Role-Based Access Control (RBAC) for better data management and multi-tenancy. Additionally, search precision settings have been refined, and these are now coupled with recall rate estimation capabilities to help optimize search accuracy and performance effectively.

## Milvus compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.4.x**. 

## BYOC - A Brand New Solution for Data Security and Permission Control{#byoc-a-brand-new-solution-for-data-security-and-permission-control}

As enterprise adoption of Zilliz Cloud grows, more and more become concerned with data security governance and permission control. Therefore, this release introduces a brand new Bring-Your-Own (BYOC) solution to meet their stringent requirements for data security and service quality in vector database services. This solution ensures:

- **Secure Communication**: Communication between the control and data planes now occurs exclusively over outbound port 443, ensuring a robust and secure connection.

- **Optimized Permissions**: Deployment and operational tasks now require minimized, fine-grained permission settings, improving security and ease of management. Please take a look at the full permission list [here](/docs/byoc/permissions-in-roles).

For more details, refer to [BYOC Overview](/docs/byoc/byoc-intro) and [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws).

## New Region Available: GCP us-central1 (lowa){#new-region-available-gcp-us-central1-lowa}

Zilliz Cloud is now accessible in the GCP us-central1 region (Iowa), offering enhanced latency and performance for users in the central United States.

For detailed pricing information of all available regions, please visit the [pricing page](https://zilliz.com/pricing).

## Support for Database Layer{#support-for-database-layer}

Zilliz Cloud now includes a database layer positioned between clusters and collections, offering an efficient way to manage and organize data while enabling multi-tenancy. In this structure, a database is a logical unit for organizing and managing data. Users can create multiple databases to logically isolate data across different applications or tenants to enhance data security and enable multi-tenancy. [Learn more about databases](/docs/database).

## mmap Support for Expanded Data Capacity{#mmap-support-for-expanded-data-capacity}

This release brings `mmap` support to Zilliz Cloud, enabling it to serve up to 3x more data optimally. `mmap` allows direct memory access to large files stored on disk, enabling Zilliz Cloud to store indexes and data across both memory and disk. This setup optimizes data placement based on access frequency, significantly expanding storage capacity for collections while preserving search performance.

For dedicated cluster users, `mmap` settings are fully customizable based on workload requirements. Users can flexibly control `mmap` strategies for vector data, scalar data, and scalar indexes within each collection. For more details on the global mmap strategies, read [Use mmap](./use-mmap).

## Collection Level RBAC Support{#collection-level-rbac-support}

This release introduces support for collection-level Role-Based Access Control (RBAC), enabling users to manage permissions and enforce multi-tenancy isolation at the collection level.

Three built-in collection-level privilege groups are now available:

- **CollectionReadOnly (COLL_RO)**: Grants read-only access to collection data.

- **CollectionReadWrite (COLL_RW)**: Grants both read and write access to collection data.

- **CollectionAdmin (COLL_ADMIN)**: Grants read and write access to collection data, along with permissions to manage collections.

For more details, [see collection level privilege groups](./cluster-privileges#collection-level-privilege-groups).

## High Recall Search{#high-recall-search}

Zilliz Cloud introduces a search parameter called `level` to optimize vector searches by controlling search precision. This parameter ranges from **1 to 10** and defaults to **1**. Adjusting the parameter allows users to balance search recall and performance:

- **Default Value (leve=1)**: Provides above 90% recall in typical cases while maintaining optimal search performance.

- **High Recall Search (level=6~10)**: For scenarios requiring high recall rates (e.g., 99% or even higher), users can set the parameter between **6** and **10**, or select **10** if performance is less critical.

This flexibility allows users to tailor search behavior to their specific requirements, achieving the desired balance between precision and speed. See [use the 'level' parameter](./single-vector-search#use-level) for more details.

## Recall Rate Estimation{#recall-rate-estimation}

We’ve introduced a feature to estimate recall rates during searches. By enabling the `enable_recall_calculation` parameter in `search_params` and setting it to `true`, you can receive system-estimated recall rates as part of your search results.

By combining recall rate estimation with the `level` parameter, users can easily identify the appropriate `level` setting to achieve the desired recall rates for their applications. For more details, refer to [get recall rate](./single-vector-search#get-recall-rate).

