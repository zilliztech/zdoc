---
title: "Access Control Explained | BYOC"
slug: /access-control-overview
sidebar_label: "Access Control Explained"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud implements Role-Based Access Control (RBAC) to finely control access to resources in Zilliz Cloud. RBAC is a security measure that grants privileges to roles rather than directly to users. These roles, which contains specific privileges to resources, are then granted to users, enabling efficient management of user access control. | BYOC"
type: origin
token: NmFBwTRj9iFuC8kXno6cqRbmnfh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Access Control Explained

Zilliz Cloud implements Role-Based Access Control (RBAC) to finely control access to resources in Zilliz Cloud. RBAC is a security measure that grants privileges to roles rather than directly to users. These roles, which contains specific privileges to resources, are then granted to users, enabling efficient management of user access control.

The Zilliz Cloud access-control model has three levels:

- **Organization level**: Manage organization membership, organization roles, billing access, and SCIM-synced groups.

- **Project level**: Manage project membership, project roles, and access to project resources such as clusters.

- **Cluster level**: Manage database users, cluster roles, and data-plane privileges for databases, collections, and other cluster resources.

These levels work together, but they do not replace each other. A user may be able to sign in to an organization without having access to a project. A project member may be able to manage project resources without automatically having every database privilege inside a cluster. A cluster user may be able to search or insert data without being an organization administrator.

## How access control is organized\{#how-access-control-is-organized}

Zilliz Cloud separates access control into **platform** **access** (control plane) and **data** **access** (data plane).

![ZPr7w2ieThqUHtbmrwFcK2n1nDB](https://zdoc-images.s3.us-west-2.amazonaws.com/ZPr7w2ieThqUHtbmrwFcK2n1nDB.png)

- **Platform access** controls organization and project level actions in the Zilliz Cloud console and control-plane APIs, such as inviting members, managing billing, creating projects, configuring clusters, and managing project-level permissions.

- **Data access** controls actions inside a cluster, such as creating cluster users, creating cluster roles, granting privileges, creating collections, building indexes, inserting data, searching, querying, and deleting data.

This separation helps teams grant the minimum access needed for each responsibility. For example, a finance teammate may need billing access but no cluster data access. A developer may need access to one project and one cluster, but no organization administration privileges.

## Organization-level access\{#organization-level-access}

An organization is the top-level boundary for Zilliz Cloud account access. 

The following is the workflow to implement organization-level RBAC in Zililz Cloud.

<Procedures>

1. [Invite organization members](./manage-platform-users#invite-organization-members) or [sync groups from SCIM](./view-scim-synced-groups).

1. [Assign a pre-defined organization role](./manage-platform-roles#manage-organization-roles) to the members or groups.

    Each organization role includes a predefined set of privileges that determines what the assigned members or groups can do at the organization level.

    The organization member automatically inherits the privileges included in the role.

</Procedures>

## Project-Level access\{#project-level-access}

A project is the main boundary for organizing cloud resources such as clusters and project-specific access policies. Project-level access controls who can work in a project and what they can do with project resources.

The following is the workflow to implement project-level RBAC in Zililz Cloud.

<Procedures>

1. [Create a custom project role](./manage-platform-roles#custom-project-roles) or use [pre-defined project roles](./manage-platform-roles#predefined-project-roles).

    Each project role includes a predefined set of privileges that determines what the assigned members an do at the project level.

1. Invite project [members](./manage-platform-users#invite-project-users) and assign the project role to user.

    The project member automatically inherits the privileges included in the role.

</Procedures>

## Cluster-Level access\{#cluster-level-access}

Cluster-level access controls data-plane permissions inside a cluster. It uses cluster users, cluster roles, privileges, and privilege groups.

This level is important because project access and cluster data access answer different questions:

- Project access answers: "Can this account user work with this project and its cloud resources?"

- Cluster access answers: "Can this cluster user perform this operation on this database, collection, or cluster resource?"

The following diagram shows the complete workflow to implement RBAC in Zilliz Cloud.

![HMUjwspQzh8MUHbC5k2cP5epnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/HMUjwspQzh8MUHbC5k2cP5epnCe.png)

<Procedures>

1. **Create a user:** In addition to the default user `db_admin` in Zilliz Cloud, you can create new users and set passwords to protect data security via the [web console](./cluster-users) or using [SDKs](./cluster-users-sdk).

1. **Create a role:** You can create customized roles via the [web console](./cluster-roles) or using [SDKs](./cluster-roles-sdk). The specific capabilities of a role are determined by its privileges.

1. **(Optional) Create a privilege group and add privileges to the privilege group:** Combine multiple [privileges](./cluster-privileges) into one privilege group to streamline the process of granting privileges to a role. In addition to the built-in privilege groups provided by Zilliz Cloud, you can also create your own customized privilege groups using the [SDKs](./cluster-privileges#custom-privilege-groups).

1. **Grant privileges or privilege groups to a role:** Define the capabilities of a role be granting privileges or privilege groups to this role. Currently you can only grant built-in privilege groups to a role on the [web console](./cluster-roles#create-a-custom-cluster-role). To grant specific privileges or customized privilege groups to a role, please [create a support ticket](http://support.zilliz.com) and then use the [SDKs](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) instead.

1. **Grant roles to users:** Grant roles with certain privileges to users so that users can have the privileges of a role. A single role can be granted to multiple users. You can complete this step either via the [web console](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) or using [SDKs](./cluster-users-sdk#grant-a-role-to-a-user).

</Procedures>

## How effective access is determined\{#how-effective-access-is-determined}

A user's effective access is the final set of permissions they receive from all applicable assignments.

In practice:

- Organization roles determine what the user can do at the organization level.

- Project roles determine what the user can do inside a specific project.

- Cluster roles determine what the cluster user can do inside a specific cluster.

- Group-based assignments can add permissions for users who belong to synced groups.

- Direct user assignments and group assignments are combined.

If a user receives access from multiple sources, Zilliz Cloud should evaluate the combined permissions. For example, if a user directly receives Data Viewer access to a project and also belongs to a SCIM group with Data Operator access to the same project, the user's effective access should include the permissions granted by both assignments.

## Example Access Patterns\{#example-access-patterns}

- **Finance User**

    A finance teammate needs to manage invoices but does not need to access project resources or cluster data.

    - Invite the user to the organization.

    - Assign **Billing Admin**.

    - Do not assign project roles unless the user also needs project access.

    - Do not create a cluster user unless the user also needs data-plane access.

- **Project Owner**

    A team lead owns one project and needs to manage users, roles, clusters, and project resources.

    - Ensure the user is an organization member.

    - Invite the user to the target project.

    - Assign **Project Admin** for that project.

    - Grant cluster-level access only if the user also needs to connect to clusters and perform data-plane operations.

**Application Writer**

**Read-Only Analyst**

## Best Practices\{#best-practices}

- Grant **Org Owner** only to a small number of administrators.

- Use **Public** as the default baseline for users who only need to sign in to the organization.

- Prefer SCIM groups for team-based access that should follow identity-provider membership.

- Use project roles to separate project responsibilities across teams.

- Create custom project roles when built-in roles are broader than the actual job function.

- Use cluster roles for data-plane permissions, especially when access must be limited to specific databases or collections.

- Review effective access when a user has both direct assignments and group-based assignments.

- Separate human access from application access whenever possible.

- Remove stale users, groups, and cluster users as part of regular access reviews.

