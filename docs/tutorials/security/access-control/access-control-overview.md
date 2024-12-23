---
title: "Access Control Explained | Cloud"
slug: /access-control-overview
sidebar_label: "Access Control Explained"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud implements Role-Based Access Control (RBAC) to finely control access to resources in Zilliz Cloud. RBAC (Role-Based Access Control) is a security measure that grants privileges to roles rather than directly to users. These roles, which contains specific privileges to resources, are then granted to users, enabling efficient management of user access control. | Cloud"
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

---

import Admonition from '@theme/Admonition';


# Access Control Explained

Zilliz Cloud implements Role-Based Access Control (RBAC) to finely control access to resources in Zilliz Cloud. RBAC (Role-Based Access Control) is a security measure that grants privileges to roles rather than directly to users. These roles, which contains specific privileges to resources, are then granted to users, enabling efficient management of user access control.

![L1WGwjF2NhxLRXbcyl6cSroNnoc](/img/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBAC architecture{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](/img/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

In Zilliz Cloud, resources are structured hierarchically from top to bottom: organizations, projects, clusters, databases, and collections.

- The organization and projects belong to the control plane where [account users](./email-accounts) use [API keys](./manage-api-keys) for authentication when interacting with control plane resources.

- The clusters, databases, and collections belong to the data plane, where [cluster users](./cluster-users) use either [API keys](./manage-api-keys) or [a username and password pairs](./cluster-credentials) (`user:password`) for authentication when interacting with data plane resources.

Note that a cluster user corresponds to exactly one account user, but an account user can correspond to multiple cluster users.

## Roles and privileges{#roles-and-privileges}

Account users are granted organization roles and project roles while cluster users are granted cluster roles that control access to cluster, databases, and collections. The following diagram illustrates the hierarchy for roles in Zilliz Cloud. 

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](/img/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **On the organization level**

    The Organization Owner role encompasses comprehensive privileges across all projects and clusters. For details about all organization roles, refer to [Organization roles](./organization-users#organization-roles).

- **On the project level**

    The Project Admin role includes all privileges of a specific project and privileges across all cluster. For details about project roles, refer to [Project roles](./project-users#project-roles).

- **On the cluster level**

    The Cluster Admin role includes all privileges of a specific cluster. For details about cluster roles, refer to [Manage Cluster Roles (Console)](./cluster-roles). Additionally, [custom roles](./cluster-roles#custom-cluster-roles) can be created at this level to precisely manage [privileges](./cluster-privileges) to cluster resources, such as databases and collections. 

