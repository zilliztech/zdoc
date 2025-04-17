---
title: "Get Started with Zilliz Cloud | Cloud"
slug: /get-started
sidebar_label: "Get Started"
beta: FALSE
notebook: FALSE
description: "Milvus is the most popular and fastest-growing open-source vector database. Zilliz provides a fully managed Milvus service, simplifying the deployment and scaling of vector search applications with security in mind, eliminating the need to construct and maintain complex infrastructure. | Cloud"
type: origin
token: BDOHwqlMDiei78kdUefcjSQUnEg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - get started
  - milvus
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source

---

import Admonition from '@theme/Admonition';


# Get Started with Zilliz Cloud

Milvus is the most popular and fastest-growing open-source vector database. Zilliz provides a fully managed Milvus service, simplifying the deployment and scaling of vector search applications with security in mind, eliminating the need to construct and maintain complex infrastructure.

## Overview{#overview}

Zilliz Cloud uses Milvus at its core but adds many cloud-native features and enterprise-grade services. The following diagram depicts Zilliz Cloud architecture, which consists of three layers, namely, infrastructure, control plane, and data plane.

![JSlVwqaoXhdrxObQyuLcMpZOnHg](/img/JSlVwqaoXhdrxObQyuLcMpZOnHg.png)

### Architecture explained{#architecture-explained}

The infrastructure layer provides essential computing and storage capabilities through multi-cloud Kubernetes clusters and block/object storage. This enables the execution of Milvus pods and control plane services across various availability zones, as well as the persistence of vector and index data in cloud storage. You can opt to create your Zilliz Cloud clusters in the region that best aligns with your latency, residency, or compliance requirements.

On top of the infrastructure layer, Zilliz Cloud arranges Milvus-backed clusters and all value-added services in a tiered structure distributed across two planes, namely the control plane and the data plane. You can map this tiered structure to the structure of your organization to create multiple projects, ensuring data separation between sectors and branches within your organization.  

- **Control plane**

    The control plane offers several value-added services. Some of these are global services, while others are project-specific or even cluster-specific. Together, these services enable the provisioning of Milvus clusters, as well as the backing up and restoring of cluster data, migrating and importing data from specific data sources, and monitoring the resource usage and query performance of your clusters.

- **Data plane**

    The data plane houses Milvus instances with various types of computing resources known as clusters. Each cluster has its own connection endpoint. You can communicate with Zilliz Cloud clusters in the same way as you work with open-source Milvus instances.

### Cluster anatomy{#cluster-anatomy}

Each Zilliz Cloud cluster runs a Milvus instance. Therefore, the resources within a Zilliz Cloud cluster are almost identical to those in an open-source Milvus instance. The following diagram illustrates the basic architecture of a Zilliz Cloud cluster.

![ZZwTwKFRlhjC4WbFgGUcLsKVn6d](/img/ZZwTwKFRlhjC4WbFgGUcLsKVn6d.png)

According to the diagram above, each Zilliz Cloud cluster has a default database. You can create multiple databases, each designed to hold collections. A collection is similar to a table in a traditional database, which consists of columns and rows. There are three types of columns in a collection: the primary field, vector fields, and scalar fields. A row in a collection is typically referred to as an entity. Within each collection, there is a default partition. All the partitions in a collection share the same schema, but each stores different entities. For details on these terms, refer to [Database](./database) and Collection.

This tiered architecture also facilitates the implementation of multi-tenancy. For details, refer to Multi-tenancy Strategies.

A cluster replica is an exact copy of a cluster. Once you have experienced a query-per-second (QPS) bottleneck, consider creating replicas for your clusters to improve query throughput and cluster availability. For details, refer to [Manage Replica](./manage-replica).

### Enhancements{#enhancements}

Although each Zilliz Cloud cluster has a Milvus instance running at its core, the Milvus instances running on Zilliz Cloud are not identical to their open-source counterparts. Zilliz has enhanced Milvus for its cloud service, particularly in terms of:

- **Cardinal search engine**

    Zilliz Cloud introduces a proprietary vector search engine called *Cardinal*, which is a multi-threaded C++ engine implementing state-of-the-art Approximate Nearest Neighbor Search (ANNS) algorithms, and it is optimized to fully utilize hardware resources. Zilliz reports that the cloud queries can handle **10× higher throughput (QPS)** than a comparable self-managed Milvus deployment. In practice, query latency on Zilliz Cloud is often **50–70% lower** than on vanilla Milvus for similar workloads. This improved engine is transparent to the user (you still use Milvus APIs), but it accelerates searches beyond the open-source defaults.

- **Autoindex**

    In open-source Milvus, choosing and building an index (e.g. IVF, HNSW, etc.) for a collection requires manual selection and tuning in code. Zilliz Cloud introduces **AutoIndex**, an AI-driven automation that selects and builds the optimal index for each dataset automatically. The system analyzes your data and queries to decide the best indexing strategy (IVF, graph-based, flat search, etc.), eliminating guesswork and tedious tuning. This not only saves engineering time but can also improve performance – *AutoIndex has been shown to speed up index building by ~40% compared to manual configuration in Milvus.*

## Scalability{#scalability}

Zilliz Cloud offers scalability both vertically (by adding/removing computing resources) and horizontally (by adding/removing replicas). Vertical scaling influences the capacity of a cluster, while horizontal scaling impacts its query throughput and availability. 

### Vertical scaling{#vertical-scaling}

As data grows, you may face constraints that impact data writing. To address such issues, you can adjust the number of compute units (CUs) to match the fluctuations in workload or storage requirements.

CU is the unit used to measure the capacity of a cluster. You can increase your cluster's capacity by scaling up CUs in response to increased CPU or memory usage, and scale down to reduce costs during periods of low demand.

Zilliz Cloud offers three types of CUs: **Performance-optimized**, **Capacity-optimized**, and **Extended-capacity**. The capacity of a cluster varies with the type of CU the cluster uses. For details, refer to [Select the Right CU](./cu-types-explained).

Zilliz Cloud allows both manual and automatic vertical scaling. For details, refer to  [Scale Cluster](./scale-cluster). 

### Horizontal scaling{#horizontal-scaling}

For users with small datasets experiencing QPS bottlenecks, adding replicas can distribute the query workload, enhancing overall query throughput and availability.

A cluster replica is an exact copy of a cluster. You can add replicas for Dedicated (Enterprise) clusters with 8 CUs or more. 

For details on adding replicas to your clusters, refer to [Manage Replica](./manage-replica).

## Security{#security}

To safeguard your data, Zilliz Cloud provides robust security measures in various aspects, including authorization and authentication, network isolation, data encryption, and backup and restoration.

### Access control{#access-control}

- Tiered access control at the organization, project, and cluster levels.

- Pre-defined roles with appropriate permissions.

For details, refer to [Access Control](./access-control).

### Account information{#account-information}

- Robust cryptographic algorithms, such as **SHA-256** and **bcrypt**.

- Stringent security policy of not storing your account information within our system.

For details on how to register an account, refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud).

### Audit logs{#audit-logs}

- Keeps records of control-plane activities and data-plane operations.

- Streams the generated data-plane logs into your block or object storage.

- Offers data insights through third-party log analysis tools.

For details, refer to [Auditing](./auditing).

### Authentication{#authentication}

- Authenticate users using the **OAuth2** protocol.

- Allows access to clusters using both API keys and cluster credentials.

For details, refer to [Authentication](./authentication).

### Data integrity{#data-integrity}

- Allows manual and automatic backup and restore

- Implements a recycle bin with an appropriate retention period.

For details, refer to [Backup & Restore](./backup-and-restore) and [Use Recycle Bin](./use-recycle-bin).

### Encryption in transit and at rest{#encryption-in-transit-and-at-rest}

- Employs the Transport Layer Protocol (**TLS**) to secure cluster access.

- Implements **server-side encryption** before data persistence.

- Uses distinct storage buckets for user-specific data within clusters.

### Private link{#private-link}

- Facilitates connection to clusters via private links tailored to cloud providers.

- Allows disabling internet connections while private links are configured.

For details, refer to [Set up a Private Endpoint](./setup-a-private-link).

### Whitelist{#whitelist}

- Allows custom CIDR blocks on the whitelist to restrict the origin of access.

- Filter out the access from non-listed IP addresses.

For details, refer to [Set up Whitelist](./setup-whitelist).

## What's more{#whats-more}

import DocCardList from '@theme/DocCardList';

<DocCardList />