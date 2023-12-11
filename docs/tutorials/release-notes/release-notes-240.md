---
slug: /docs/release-notes-240
beta: FALSE
notebook: FALSE
sidebar_position: 0
---

import Admonition from '@theme/Admonition';


# Release Notes v2.4.0

We are excited to announce the release of Zilliz Cloud 2.4.0. Now Zilliz Cloud services are available on Azure, starting with the East US region. Additionally, we introduce Zilliz Cloud Pipelines (Beta) which transforms unstructured data into vector embeddings for ingestion and retrieval. The release also brings improved RBAC and credential management within Clusters, with three predefined roles (admin, read-write, read-only) for user administration. Other updates include enhanced error message content and stability improvements for more reliable service.

### Zilliz Cloud on Azure{#zilliz-cloud-on-azure}

We're excited to announce a significant expansion in our offerings: Zilliz Cloud services are now accessible on Azure, starting with the East US region. This marks a key milestone as our platform now seamlessly integrates with the three major public clouds: AWS, GCP, and Azure, ensuring a consistent and unified user experience across multiple environments. If your business requirements necessitate deployment in regions beyond Azure East US, please [__contact us__](https://support.zilliz.com/hc/en-us) for further support.

### Pipeline{#pipeline}

Today, we are thrilled to introduce Zilliz Cloud Pipelines (Beta), a new addition to Zilliz Cloud. Pipelines is designed to unlock the potential of unstructured data by seamlessly transforming it into vector embeddings and ingesting them into Zilliz Cloud for storage and retrieval. This solution simplifies data workflows by consolidating processes like embedding, ingestion, storage, and retrieval, providing a welcome relief for developers who would otherwise grapple with integrating multiple stacks when building modern search applications, such as the cutting-edge [__Retrieval Augmented Generation (RAG)__](https://zilliz.com/use-cases/llm-retrieval-augmented-generation).

Zilliz Cloud Pipelines consists of three specific pipelines: Ingestion, Search, and Deletion.

- **Ingestion pipeline** is the workhorse that processes unstructured data, transforming it into searchable vector embeddings and ingesting them into Zilliz Vector Database for storage and retrieval.

- **Search pipelines** facilitate semantic search by converting a query string into vector embeddings and sending them into Zilliz Cloud for retrieving the top-K most similar vectors.

- **Deletion Pipeline** allows you to remove all chunks in a specified document from a Zilliz Cloud collection, offering you full control over your own data and releasing the storage capacity of your Zilliz collections.

To learn more information, please refer to this [__documentation__](/docs/understanding-pipelines).

### RBAC and Credential Management in Your Clusters{#rbac-and-credential-management-in-your-clusters}

In this release, we introduce enhanced functionality for managing RBAC (Role-Based Access Control) and credentials within each Cluster. This streamlined approach allows users to efficiently administer Cluster users. To access these features, navigate to the 'Clusters' section, select 'your_cluster', and then proceed to the 'Users' tab. This release includes three predefined roles for simplified user management: 'admin', 'read-write', and 'read-only', each tailored to suit different levels of access and control needs. For more comprehensive details and guidance on utilizing these new capabilities, see the [__documentation__](./create-built-in-roles).

### Enhancements{#enhancements}

This release also includes a series of enhancements:

- Improved content for a set of error messages.

- Stability Enhancements: Addressing known issues to further enhance the reliability of our service.

