---
title: "Environment Isolation | Cloud"
slug: /environment-isolation
sidebar_label: "Environment Isolation"
beta: FALSE
notebook: FALSE
description: "Proper environment isolation and access control are essential in enterprise application development and deployment. Zilliz Cloud offers flexible isolation through a hierarchical structure of Organizations, Projects, and Clusters. This guide helps you select the most appropriate strategy based on your operational, security, and financial requirements. | Cloud"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - multi-tenancy
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm

---

import Admonition from '@theme/Admonition';


# Environment Isolation

Proper environment isolation and access control are essential in enterprise application development and deployment. Zilliz Cloud offers flexible isolation through a hierarchical structure of **Organizations**, **Projects**, and **Clusters**. This guide helps you select the most appropriate strategy based on your operational, security, and financial requirements.

## Organization-level isolation{#organization-level-isolation}

Organization-level isolation is the most secure option.

**Best suited for:**

- Separate billing accounts (e.g., multiple different AWS subscription accounts)

- Independent invoice and cost management

- Strict user access boundaries across environments

**How to implement:**

- Create a distinct [organization](./organizations) for each environment (e.g., production, development, testing)

- Each organization can be linked to a unique [payment method](/docs/payment-billing)

- By default, only one single organization is supported by Zilliz Cloud. If you need multiple organization, please submit a request in the [Support Portal](https://support.zilliz.com/hc/en-us).

## Project-level isolation{#project-level-isolation}

This option is recommended for most enterprise-grade production deployments where billing separation is not a requirement.

**Best suited for:**

- Shared billing across environments under a single payment method

- Tracking resource [usage](/docs/analyze-cost) by environment

- Managing user [roles](./project-users#project-roles) with moderate isolation

**Benefits:**

- Fine-grained user access control at the [project](./projects) level

- Consolidated billing with per-environment usage tracking

- Sufficient isolation for most enterprise use cases

## Cluster-level isolation{#cluster-level-isolation}

This is the most agile and lightweight option.

**Best suited for:**

- Small teams focused on rapid iteration

- Minimal access control needs

- Basic workload separation

**Features:**

- Multiple [clusters](./cluster) under the same project

- Each cluster has dedicated compute/storage resources for workload isolation

- Centralized [monitoring](./metrics-and-alerts) for easier operation and management

## Choosing the right isolation strategy{#choosing-the-right-isolation-strategy}

Use the following flow to guide your decision:

1. **Do you need separate billing or invoices?**
 → Yes: Use **Organization-level isolation**

1. **Do you need role-based access control per environment?**
 → Yes: Use **Project-level isolation**

1. **Neither of the above?**
 → Use **Cluster-level isolation** for simplicity

For tailored recommendations, please contact the [Zilliz Cloud Support Team](https://support.zilliz.com/hc/en-us).

