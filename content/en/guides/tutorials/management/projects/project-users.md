---
title: "Manage Project Users | Cloud"
slug: /project-users
sidebar_label: "Project Users"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, you can invite users to projects and assign them roles based on their job functions. These roles determine the user's access to project resources and the operations they can perform. | Cloud"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Manage Project Users

In Zilliz Cloud, you can invite users to projects and assign them roles based on their job functions. These roles determine the user's access to project resources and the operations they can perform.

This topic describes how to manage project users.

## Invite a user to a project\{#invite-a-user-to-a-project}

To invite users to a project, you must be an **Organization Owner** or **Project Admin**.  

1. Enter the email addresses of the users you want to invite.

1. Choose how to assign access:

    - [Project Admin](./project-users#project-admin) — Grants full control over the project and all its resources.

    - Custom [project access policy](./project-users#project-access) — Configure specific privileges for the user within the project.

Invitation recipients will receive an email invitation that must be accepted within 48 hours to join the project. Alternatively, you can also copy the invitation link from the web console and share it with the invitees.

Once the user joins the project, they automatically become an Organization Member in the organization to which the project belongs.

<Admonition type="info" icon="📘" title="📘 Notes">

Each time, you can invite one or more users with the same role to join the project.

</Admonition>

### Project Admin\{#project-admin}

A **Project Admin** role has full privileges to manage a project and all its resources (clusters, databases, collections).

### Project Access\{#project-access}

To minimize access permissions, you can also configure fine-grained privileges for cluster and volume access for the invited user.

![Gs3jwYjb6hVbunbyASAcVUp3nIe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Gs3jwYjb6hVbunbyASAcVUp3nIe.png)

- **Cluster Access**

    By default, access is granted to **All Clusters** with the **Include all future clusters** option enabled. You can assign a role, such as **Read-Write***,* to define the invited user's permissions across these clusters. Once the invitation is accepted, the user will have the specified privileges on all current and future clusters within the project. 

    To limit access, select specific clusters from the dropdown. You can also disable the **Include all future clusters** option to exclude newly created clusters from the access scope.

    Click **+ Cluster Access** to add more cluster access policies.

- **Volume Access**

    By default, access is granted to **All Volumes** with the **Include all future volumes** option enabled. You can assign a role, such as **Read-Write***,* to define the invited user's permissions across these volumes. Once the invitation is accepted, the user will have the specified privileges on all current and future volumes within the project. 

    To limit access, select specific volumes from the dropdown. You can also disable the **Include all future volumes** option to exclude newly created volumes from the access scope.

    Click **+ Volume Access** to add more cluster access policies.

You can find the specific privileges of the **Read-Write,** **Read-Only and **Cluster Admin** roles in the following sections.

#### Read-Write\{#read-write}

A Read-Write role has the privileges to view a project and manage its resources (clusters, databases, collections). 

#### Read-Only\{#read-only}

A Read-Only role has the privileges to view a project and its resources (clusters, databases, collections). 

#### Cluster Admin\{#cluster-admin}

A Cluster Admin role has the privileges to view a project and manage its resources (clusters, databases, collections). 

In addition to the privileges of a Project Read-Write role, a Cluster Admin can perform cluster operations such as scaling, suspending, and resuming clusters.

### Project role and access comparison\{#project-role-and-access-comparison}

The following tables provide a quick comparison of the privileges of different project roles.

**On-demand compute**

| Operation | Project Admin | Cluster Admin | Project Read/Write | Project Read-Only |
| --- | --- | --- | --- | --- |
| Create On-Demand Cluster | ✅ | ❌ | ❌ | ❌ |
| View On-Demand Cluster List and Details | ✅ | ✅ | ✅ | ✅ |
| Modify, Rename, or Delete On-Demand Cluster | ✅ | ❌ | ❌ | ❌ |
| Create Database in On-demand Compute | ✅ | ✅ | ✅ | ❌ |
| View Database List in On-demand Compute | ✅ | ✅ | ✅ | ❌ |
| Delete Database in On-demand Compute | ✅ | ❌ | ❌ | ❌ |
| Create or Delete Collections in Database in On-demand Compute | ✅ | ✅ | ✅ | ❌ |
| Import Data into Collections in Database in On-demand Compute | ✅ | ✅ | ✅ | ❌ |
| Run Query, Search, or Get through On-Demand Cluster | ✅ | ✅ | ✅ | ✅ |
| Create Managed Volume or External Volume | ✅ | ❌ | ❌ | ❌ |

**Cluster operations**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Create Cluster | ✅ | ❌ | ❌ | ❌ |
| Drop Cluster | ✅ | ❌ | ❌ | ❌ |
| Scale Cluster Query CU | ✅ | ✅ | ❌ | ❌ |
| Scale Cluster Replica | ✅ | ✅ | ❌ | ❌ |
| Suspend Cluster | ✅ | ✅ | ❌ | ❌ |
| Resume Cluster | ✅ | ✅ | ❌ | ❌ |
| View Cluster List | ✅ | ✅ | ✅ | ✅ |
| View Cluster Details | ✅ | ✅ | ✅ | ✅ |
| View Cluster Metrics | ✅ | ✅ | ✅ | ✅ |

**Cluster users**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Cluster User List | ✅ | ✅ | ✅ | ✅ |
| Create Cluster User | ✅ | ✅ | ❌ | ❌ |
| Reset the Password of a Cluster User | ✅ | ✅ | ❌ | ❌ |
| Delete Cluster User | ✅ | ✅ | ❌ | ❌ |

**Audit logs**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Enable Audit Logs | ✅ | ✅ | ❌ | ❌ |
| Edit Audit Logs Configuration | ✅ | ✅ | ❌ | ❌ |
| Disable Audit Logs | ✅ | ✅ | ❌ | ❌ |
| View the Status of Audit Logs | ✅ | ✅ | ✅ | ✅ |

**Data plane operations**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Create Collection | ✅ | ✅ | ✅ | ❌ |
| Drop Collection | ✅ | ✅ | ✅ | ❌ |
| List/Describe Collection | ✅ | ✅ | ✅ | ✅ |
| Insert/Upsert | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| Query/Search/Get | ✅ | ✅ | ✅ | ✅ |
| Bulk Import | ✅ | ✅ | ✅ | ❌ |
| All other RESTful operations | ✅ | ✅ | ✅ | Depends |

<Admonition type="info" icon="📘" title="📘 Notes">

Both the Cluster Admin and the Project Read-Write roles share the same data plane privileges.       

</Admonition>

**Backup and restore**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Backup List | ✅ | ✅ | ✅ | ✅ |
| Create Backup | ✅ | ✅ | ❌ | ❌ |
| Restore a cluster backup file to a new cluster | ✅ | ❌ | ❌ | ❌ |
| Restore a collection backup file to an existing cluster | ✅ | ✅ | ❌ | ❌ |
| Delete cluster backup | ✅ | ✅ | ❌ | ❌ |

**Volume**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Volume List | ✅ | ✅ | ✅ | ✅ |
| Create Volume | ✅ | ❌ | ❌ | ❌ |
| Delete Volume | ✅ | ❌ | ❌ | ❌ |

**Migration**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Migration Jobs | ✅ | ✅ | ✅ | ✅ |
| Create Migration Job | ✅ | ✅ | ❌ | ❌ |
| Cancel a Migration Job | ✅ | ✅ | ❌ | ❌ |
| View the Details of a Migration Job (View Migrated Collections/Databases) | ✅ | ✅ | ✅ | ✅ |

**Jobs**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Job List | ✅ | ✅ | ✅ | ✅ |
| View Job Details | ✅ | ✅ | ✅ | ✅ |
| Cancel Job | ✅ | ✅ | ❌ | ❌ |
| Retry Job | ✅ | ✅ | ❌ | ❌ |

**Project alerts**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Alert List | ✅ | ✅ | ✅ | ✅ |
| Create Alert | ✅ | ✅ | ✅ | ✅ |
| Edit Alert | ✅ | ✅ | ✅ | ✅ |
| Delete Alert | ✅ | ✅ | ✅ | ✅ |
| View Alert History | ✅ | ✅ | ✅ | ✅ |

**Collaborators**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Invite Project Collaborator | ✅ | ❌ | ❌ | ❌ |
| Edit the Role of a Project Collaborator | ✅ | ❌ | ❌ | ❌ |
| Remove Project Collaborator | ✅ | ❌ | ❌ | ❌ |

**Cluster IP allowlist**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Cluster IP Allowlist | ✅ | ✅ | ✅ | ✅ |
| Add IP Address to the Cluster IP Allowlist | ✅ | ❌ | ❌ | ❌ |
| Modify IP Address in the Cluster IP Allowlist | ✅ | ❌ | ❌ | ❌ |
| Delete IP Address from the Cluster IP Allowlist | ✅ | ❌ | ❌ | ❌ |

**Private endpoints**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Private Endpoint List | ✅ | ✅ | ✅ | ✅ |
| Create Private Endpoint | ✅ | ❌ | ❌ | ❌ |
| Delete Private Endpoint | ✅ | ❌ | ❌ | ❌ |

**CMEK**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View CMEK List | ✅ | ✅ | ✅ | ✅ |
| Add CMEK | ✅ | ❌ | ❌ | ❌ |
| Delete CMEK | ✅ | ❌ | ❌ | ❌ |

**Integrations**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| View Integrations List | ✅ | ✅ | ✅ | ✅ |
| View Datadog Integration | ✅ | ✅ | ✅ | ✅ |
| Create Datadog Integration | ✅ | ❌ | ❌ | ❌ |
| Edit Datadog Integration Configuration | ✅ | ❌ | ❌ | ❌ |
| Delete Datadog Integration | ✅ | ❌ | ❌ | ❌ |
| View Storage Integration | ✅ | ✅ | ✅ | ✅ |
| Create Storage Integration | ✅ | ❌ | ❌ | ❌ |
| Delete Storage Integration | ✅ | ❌ | ❌ | ❌ |

## Revoke or resend an invitation\{#revoke-or-resend-an-invitation}

When you invite an existing organization member to a project within the same organization, they automatically gain access to the project without receiving a separate invitation. However, if you invite someone to a project within an organization they are not already a part of, they will receive an invitation to join the organization, which also grants them access to the specified project.

![CKuxwsNxihJzNtbQ4fBc1xHRnxf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CKuxwsNxihJzNtbQ4fBc1xHRnxf.png)

To revoke or resend the invitation, you must be an **Organization Owner** or a **Project Admin**.

<Admonition type="info" icon="📘" title="📘 Notes">

You can revoke or resend an invitation before the user accepts it.

</Admonition>

## Edit a collaborator's role\{#edit-a-collaborators-role}

After a user accepts the invitation, they become a project collaborator.

To edit a collaborator's role, you must be an **Organization Owner** or a **Project Admin**.

![DCvMwB44UhQdXRbmxdUc493ynJb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DCvMwB44UhQdXRbmxdUc493ynJb.png)

## Remove a collaborator\{#remove-a-collaborator}

To remove a project collaborator, you must be an **Organization Owner** or a **Project Admin**.

![HKpow0x7qheStnb0zcOcDlyunHc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HKpow0x7qheStnb0zcOcDlyunHc.png)

## Leave a project\{#leave-a-project}

In addition to removing a collaborator from a project, you can also remove yourself by leaving it.

![DTwiwN0AThgVZLb60dMcSblDnsb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DTwiwN0AThgVZLb60dMcSblDnsb.png)

Note that if you are the only admin of a project, you cannot leave it as each project must have at least one Project Admin at all times.

<Admonition type="info" icon="📘" title="🚧 Warning">

Once you leave a project, your access to the project and associated resources will be revoked.

</Admonition>

