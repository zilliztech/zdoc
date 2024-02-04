---
slug: /release-notes-250
beta: FALSE
notebook: FALSE
token: VbjiwU5RYi4bWdkC48Jceltnnpd
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Release Notes (Jan 18, 2024)

Zilliz Cloud now officially supports the Bring-Your-Own-Cloud (BYOC) subscription plan. Additionally, we have optimized the user experience for data import features, refined API keys with hierarchical permissions, and enhanced the metrics and alerts mechanism.

## Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.2.x** and **Milvus 2.3.x (Beta)**.

## Bring Your Own Cloud{#bring-your-own-cloud}

Today, we're thrilled to unveil the Zilliz Bring Your Own Cloud (BYOC) deployment model. This innovative approach offers you the best of both worlds: fully managed vector database services right in your own Virtual Private Cloud (VPC) for top level data security, with Zilliz expertly handling all operations and maintenance.

In the rapidly evolving landscape of machine learning and artificial intelligence, one aspect that cannot be overlooked is the importance of security. For those who are facing stringent security and internal compliance demands, having tight control over your data is non-negotiable. The ideal solution is to store and manage all your data within your own Virtual Private Cloud (VPC). But here’s a key insight: the majority of today's vector database services are designed as SaaS, meaning both your control plane and data plane typically reside within your vendor's VPC, as shown below:

![VbKXbqrLhoPaIrxDEVTcmeOzn0c](/byoc/VbKXbqrLhoPaIrxDEVTcmeOzn0c.png)

Bring Your Own Cloud (BYOC) is a deployment model which sits somewhere between a SaaS cloud service and an on-premise deployment. For the data plane part, the vendor deploys their software in a VPC in the customer account. And for the control plane part, the vendor manages most of the administration for the customer:

![NjzYboVmVoziKZxLu0vchbNunbh](/byoc/NjzYboVmVoziKZxLu0vchbNunbh.png)

For more details of Zilliz Cloud BYOC, see __Ensuring Vector Data Security with Zilliz 'Bring Your Own Cloud' Option__.

## Data Import{#data-import}

We are excited to announce support for the Parquet data format in our latest release. To enhance user experience, we've introduced the PyMilvus writer utility, a powerful tool designed to assist our users in effortlessly creating files in JSON or Parquet formats for seamless data import. Dive into the details and explore the new possibilities [__here__](./data-import).

## API Key{#api-key}

In this release, Zilliz Cloud introduced a unified design for the [API Key](./manage-api-keys). Each user can access the Zilliz Cloud platform and multiple Clusters using a single unified API key.

The permission design of Zilliz Cloud follows the RBAC (Role-Based Access Control) principles, divided into two layers: the Operation Layer and the Data Layer. In the Operation Layer, roles govern the operational permissions of resources such as Clusters, Projects, Users, and Billing. In the Data Layer, roles focus on controlling the capabilities of adding, deleting, modifying, and querying data.

[Unsupported block type]

In the Operation Layer, Zilliz Cloud supports four types of roles, of which Organization Owner, Project Owner, and Project Member are three commonly used roles:

- Organization Owner: Has full management rights over the organization, including organizational settings, managing payment methods and billing, API Keys, all projects in the organization, and related resources.

- Project Owner: Has full management rights over the project, including project settings, all clusters within the project, API Keys, and other related resources.

- Project Member: Has read and write permissions to all clusters within the project, can view cluster details, and manage Collections and Indexes.

In the Data Layer, Zilliz Cloud provides three built-in roles: Admin, Read-Only, and Read-Write, to control management, write, and read permissions of data. Zilliz Cloud allows users to create custom roles. These custom roles can define permissions for specific Collections, Partitions, or operations, ensuring the principle of minimal data permissions while using Zilliz Cloud. See the __documentations__ to learn the details.

## Metrics & Alert{#metrics-and-alert}

In this release, we made a refactor of [metric boards and alert system](./metrics-and-alerts). In the new version, you have the capability to monitor a comprehensive range of metrics:

- Resource Usage Metrics: This includes a detailed view of CU (Compute Unit) computation resource utilization, CU capacity utilization (fullness), and overall storage usage.

- Performance Metrics: Keep track of critical performance indicators such as search/query throughput and latency, the efficiency of data insertion (both throughput and latency), and the rate of request failures.

- Data Metrics: Get insights into the number of collections, the total count of entities, the number of loaded entities for search, and the number of indexed entities.

Additionally, our enhanced Alert System allows you to set customized alert rules for all the aforementioned metrics. This means you can create alerts for scenarios like when the Query Per Second (QPS) rate surpasses 1000, or when the CU fullness exceeds 70%, ensuring you stay informed and proactive about your system's health and performance.

## Enhancements{#enhancements}

This release also includes a series of enhancements:

- Improved experience of several web console pages.

- Stability Enhancements: addressing known issues to further enhance the reliability of our service.

