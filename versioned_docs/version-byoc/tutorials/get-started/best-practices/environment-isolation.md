---
title: "Environment Isolation | BYOC"
slug: /environment-isolation
sidebar_label: "Environment Isolation"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Proper environment isolation and access control are essential in enterprise application development and deployment. Zilliz Cloud offers flexible isolation through a hierarchical structure of Organizations, Projects, and Clusters. This guide helps you select the most appropriate strategy based on your operational, security, and financial requirements. | BYOC"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - multi-tenancy
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus

---

import Admonition from '@theme/Admonition';


# Environment Isolation

Proper environment isolation and access control are essential in enterprise application development and deployment. Zilliz Cloud offers flexible isolation through a hierarchical structure of **Organizations**, **Projects**, and **Clusters**. This guide helps you select the most appropriate strategy based on your operational, security, and financial requirements.

## Project-level isolation\{#project-level-isolation}

This option is recommended for most enterprise-grade production deployments where billing separation is not a requirement.

**Best suited for:**

- Managing user [roles](./project-users#project-roles) with moderate isolation

**Benefits:**

- Fine-grained user access control at the [project](./projects) level

- Consolidated billing with per-environment usage tracking

- Sufficient isolation for most enterprise use cases

## Cluster-level isolation\{#cluster-level-isolation}

This is the most agile and lightweight option.

**Best suited for:**

- Small teams focused on rapid iteration

- Minimal access control needs

- Basic workload separation

**Features:**

- Multiple [clusters](./cluster) under the same project

- Each cluster has dedicated compute/storage resources for workload isolation

- Centralized [monitoring](./metrics-and-alerts) for easier operation and management

## Choosing the right isolation strategy\{#choosing-the-right-isolation-strategy}

Use the following flow to guide your decision:

1. **Do you need separate billing or invoices?**
 → Yes: Use **Organization-level isolation**

1. **Do you need role-based access control per environment?**
 → Yes: Use **Project-level isolation**

1. **Neither of the above?**
 → Use **Cluster-level isolation** for simplicity

For tailored recommendations, please contact the [Zilliz Cloud Support Team](https://support.zilliz.com/hc/en-us).

