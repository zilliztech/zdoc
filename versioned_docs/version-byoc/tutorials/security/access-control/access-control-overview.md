---
title: "Access Control Explained | BYOC"
slug: /access-control-overview
sidebar_label: "Access Control Explained"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud implements Role-Based Access Control (RBAC) to finely control access to resources in Zilliz Cloud. RBAC (Role-Based Access Control) is a security measure that grants privileges to roles rather than directly to users. These roles, which contains specific privileges to resources, are then granted to users, enabling efficient management of user access control. | BYOC"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search

---

import Admonition from '@theme/Admonition';


# Access Control Explained

Zilliz Cloud implements Role-Based Access Control (RBAC) to finely control access to resources in Zilliz Cloud. RBAC (Role-Based Access Control) is a security measure that grants privileges to roles rather than directly to users. These roles, which contains specific privileges to resources, are then granted to users, enabling efficient management of user access control.

![L1WGwjF2NhxLRXbcyl6cSroNnoc](/byoc/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBAC architecture{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](/byoc/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloud organizes its resources within two planes, implementing RBAC across both:

- **Control plane:** This plane encompasses organizations, projects, and cluster management. [Account users](./email-accounts) are granted specific organization and project roles and authenticate via [API keys](./manage-api-keys) when interacting with resources on the control plane.

- **Data plane:** This plane includes clusters, databases, and collections, focusing on data access management. [Cluster users](./cluster-users) are granted appropriate cluster roles and authenticate using [API keys](./manage-api-keys) or [username-password pairs](./cluster-credentials) when interacting with data plane resources.

Normally, each account user corresponds to a cluster user. However, not all users require access for both planes. In some cases, a control plane account user like a Billing Admin might only need access to the control plane for billing management purposes and do not require data plane access. Conversely, temporary cluster users can be created and granted access to data plane resources through customized API keys, allowing data access without a registered account. For details about managing customized API keys, refer to [API Keys](./manage-api-keys).

## Roles and privileges{#roles-and-privileges}

Account users are granted organization roles and project roles while cluster users are granted cluster roles that control access to cluster, databases, and collections. The following diagram illustrates the hierarchy for roles in Zilliz Cloud. 

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](/byoc/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **On the organization level**

    - The Organization Owner role encompasses comprehensive privileges across all projects and clusters.

    For details about all organization roles, refer to [Organization roles](./organization-users#organization-roles).

- **On the project level**

    - The Project Admin role includes all privileges of a specific project and privileges across all cluster.

    - The Project Read-Write role has the privileges to view a project and manage its resources.

    - The Project Read-Only role has the privileges to view a project and its resources.

    For details about project roles, refer to [Project roles](./project-users#project-roles).

- **On the cluster level**

    - The Cluster Admin role includes all privileges of a specific cluster.

    - The Cluster Read-Write role has the privileges to view a cluster and manage all its resources.

    - The Cluster Read-Only role has the privileges to view a cluster and its resources.

    - Additionally, [custom roles](./cluster-roles#custom-cluster-roles) can be created at this level to precisely manage [privileges](./cluster-privileges) to cluster resources, such as databases and collections.

    For details about cluster roles, refer to [Manage Cluster Roles (Console)](./cluster-roles).

