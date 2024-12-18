---
title: "Access Control | Cloud"
slug: /access-control
sidebar_label: "Access Control"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud implements Role-Based Access Control (RBAC) to govern access to the Zilliz Cloud vector database. A user is granted a role that determines the user's access to Zilliz Cloud resources and privileges to perform certain operations. With RBAC, you can finely control the operations users can perform at the data plane (clusters, databases, collections), enhancing data security. | Cloud"
type: origin
token: UEFXwAUL4icMjMkUej9cqncJncd
sidebar_position: 26
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac

---

import Admonition from '@theme/Admonition';


# Access Control

Zilliz Cloud implements Role-Based Access Control (RBAC) to govern access to the Zilliz Cloud vector database. A user is granted a role that determines the user's access to Zilliz Cloud resources and privileges to perform certain operations. With RBAC, you can finely control the operations users can perform at the data plane (clusters, databases, collections), enhancing data security. 

## What is RBAC?{#what-is-rbac}

Unlike traditional user access control models, RBAC introduces the concept of roles. In this model, privileges are granted to roles, which are then assigned to users, allowing them to inherit these privileges.

This method significantly improves the efficiency of access control management by enabling batch updates to user privileges through role adjustments. For instance, creating a role for users who need similar access eliminates the need to configure privileges individually.

![EvVfwE77Fh2XUsbq4Woc1tj4nde](/img/EvVfwE77Fh2XUsbq4Woc1tj4nde.png)

There are four key concepts in the RBAC model: resource, privilege, role, and user.

### Resource{#resource}

![GK4fwbKzjhlj3ab7h6Uca0FDn3b](/img/GK4fwbKzjhlj3ab7h6Uca0FDn3b.png)

The figure above illustrates the resource hierarchy in Zilliz Cloud. Resources in Zilliz Cloud are managed through two primary planes:

- Control Plane: Manages organizational and project-level resources. On this plane, account users are granted [organization](./organization-users) roles and [project](./project-users) roles.

- Data Plane: Manages clusters, databases, and collections. On this plane, users here are granted either [cluster built-in roles](./cluster-roles#built-in-cluster-roles) or [custom roles](./cluster-roles#custom-cluster-roles) that define their permissions within these resources.

### Privilege{#privilege}

A privilege is the permission to perform certain operations on Zilliz Cloud resources (eg. create collections, insert data to a collection, etc). 

A privilege group is a combination of individual privileges. Creating privilege groups is an efficient means to grant multiple commonly used privileges in bulk to a role.

![GvxtwvNgFhlI6JbH8mycEFIynDc](/img/GvxtwvNgFhlI6JbH8mycEFIynDc.png)

As shown in the figure above, suppose you need to grant three different privileges to a role.

- If you do not use a privilege group, you need to grant the privileges three times.

- If you use a privilege group, you only need to create a privilege group and add the three privileges to this privilege group and grant the privilege group to Role A.

For details about the built-in privilege groups provided by Zilliz Cloud and a list of all available privileges, refer to [Privileges](./cluster-privileges).

### Role{#role}

A role consists of two parts: privileges and resources. Privileges define the type of operations that a role can perform while resources define the target resources that the operations can be performed on. For example, the database administrator role can perform read, write, and manage operations on certain databases.

Zilliz Cloud offers roles on the organization, project, cluster levels to facilitate data security.

![VeSVw3EM2hIKosbinL8cNS2Dnoe](/img/VeSVw3EM2hIKosbinL8cNS2Dnoe.png)

The figure above illustrates the role hierarchy in Zilliz Cloud.

- **Organization Roles**

    - Organization Owner: Holds all privileges for managing an organization and those of Project Admin and Cluster Admin roles.

    - Organization Billing Admin: Primarily manages billing and does not access project or cluster data.

    - Organization Member: Can view an organization, with project and cluster privileges defined by additional project and cluster roles.

    For details, refer to [Manage Organization Users](./organization-users#organization-roles).

- **Project Roles**

    - Project Admin: Manages a project and holds all privileges of the Cluster Admin role.

    - Project Read-Write: Handles data read and write within a project, including privileges of the Cluster Read-Write and Read-Only roles.

    - Project Read-Only: Views project data and holds all privileges of the Cluster Read-Only role.

    For details, refer to [Manage Project Users](./project-users#project-roles).

- Cluster Roles

    - Cluster Admin: Manages a cluster and all associated resources (databases, collections).

    - Cluster Read-Write : Views a cluster and manages all associated resources.

    - Cluster Read-Only: Views cluster resources only.

    For details, refer to [Manage Cluster Roles](./cluster-roles).

### User{#user}

A user is someone who uses Zilliz Cloud. 

- Account users: Operate on the control plane and authenticate with [API keys](./manage-api-keys).

- Cluster Users: Operate on the data plane and authenticate with [username and password credentials](./cluster-credentials-console).



import DocCardList from '@theme/DocCardList';

<DocCardList />