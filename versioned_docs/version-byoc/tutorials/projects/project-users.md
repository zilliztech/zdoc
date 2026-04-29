---
title: "Manage Project Users | BYOC"
slug: /project-users
sidebar_key: project-users
sidebar_label: "Project Users"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, you can invite users to projects and assign them roles based on their job functions. These roles determine the user's access to project resources and the operations they can perform. | BYOC"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - project users

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

<Admonition type="info" icon="📘" title="Notes">

<p>Each time, you can invite one or more users with the same role to join the project.</p>

</Admonition>

### Project Admin\{#project-admin}

A **Project Admin** role has full privileges to manage a project and all its resources (clusters, databases, collections).

### Project Access\{#project-access}

To minimize access permissions, you can also configure fine-grained privileges for cluster access for the invited user.

![A3DtwF7hfhKyqNboWfmcKT9Unxw](https://zdoc-images.s3.us-west-2.amazonaws.com/A3DtwF7hfhKyqNboWfmcKT9Unxw.png)

By default, access is granted to **All Clusters** with the **Include all future clusters** option enabled. You can assign a role, such as **Read-Write***,* to define the invited user's permissions across these clusters. Once the invitation is accepted, the user will have the specified privileges on all current and future clusters within the project. 

To limit access, select specific clusters from the dropdown. You can also disable the **Include all future clusters** option to exclude newly created clusters from the access scope.

Click **+ Cluster Access** to add more cluster access policies.

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

**Cluster operations**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>Create Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Scale Cluster Query CU</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Scale Cluster Replica</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Suspend Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Resume Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View Cluster List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Cluster Details</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Cluster Metrics</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**Cluster users**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Cluster User List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Cluster User</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Reset the Password of a Cluster User</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete Cluster User</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Audit logs**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>Enable Audit Logs</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Edit Audit Logs Configuration</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Disable Audit Logs</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View the Status of Audit Logs</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**Data plane operations**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>Create Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>List/Describe Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Insert/Upsert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Query/Search/Get</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Bulk Import</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>All other RESTful operations</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>Depends</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Both the Cluster Admin and the Project Read-Write roles share the same data plane privileges.       </p>

</Admonition>

**Backup and restore**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Backup List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Backup</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Restore a cluster backup file to a new cluster</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Restore a collection backup file to an existing cluster</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete cluster backup</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Volume**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Volume List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Volume</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete Volume</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Migration**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Migration Jobs</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Migration Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Cancel a Migration Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View the Details of a Migration Job (View Migrated Collections/Databases)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**Jobs**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Job List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Job Details</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Cancel Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Retry Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Project alerts**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Alert List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Alert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Edit Alert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Delete Alert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Alert History</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**Collaborators**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>Invite Project Collaborator</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Edit the Role of a Project Collaborator</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Remove Project Collaborator</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Cluster IP allowlist**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Add IP Address to the Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Modify IP Address in the Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete IP Address from the Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Private endpoints**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Private Endpoint List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Private Endpoint</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete Private Endpoint</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**CMEK**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View CMEK List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Add CMEK</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete CMEK</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Integrations**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Project Admin</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>Project Read-Write</strong></p></th>
     <th><p><strong>Project Read-Only</strong></p></th>
   </tr>
   <tr>
     <td><p>View Integrations List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Datadog Integration</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Datadog Integration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Edit Datadog Integration Configuration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete Datadog Integration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View Storage Integration</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Storage Integration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete Storage Integration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

## Revoke or resend an invitation\{#revoke-or-resend-an-invitation}

When you invite an existing organization member to a project within the same organization, they automatically gain access to the project without receiving a separate invitation. However, if you invite someone to a project within an organization they are not already a part of, they will receive an invitation to join the organization, which also grants them access to the specified project.

![CKuxwsNxihJzNtbQ4fBc1xHRnxf](https://zdoc-images.s3.us-west-2.amazonaws.com/CKuxwsNxihJzNtbQ4fBc1xHRnxf.png)

To revoke or resend the invitation, you must be an **Organization Owner** or a **Project Admin**.

<Admonition type="info" icon="📘" title="Notes">

<p>You can revoke or resend an invitation before the user accepts it.</p>

</Admonition>

## Edit a collaborator's role\{#edit-a-collaborators-role}

After a user accepts the invitation, they become a project collaborator.

To edit a collaborator's role, you must be an **Organization Owner** or a **Project Admin**.

![H1hUwVUrThoYtYbeMVccsswync5](https://zdoc-images.s3.us-west-2.amazonaws.com/H1hUwVUrThoYtYbeMVccsswync5.png)

## Remove a collaborator\{#remove-a-collaborator}

To remove a project collaborator, you must be an **Organization Owner** or a **Project Admin**.

![HKpow0x7qheStnb0zcOcDlyunHc](https://zdoc-images.s3.us-west-2.amazonaws.com/HKpow0x7qheStnb0zcOcDlyunHc.png)

## Leave a project\{#leave-a-project}

In addition to removing a collaborator from a project, you can also remove yourself by leaving it.

![DTwiwN0AThgVZLb60dMcSblDnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/DTwiwN0AThgVZLb60dMcSblDnsb.png)

Note that if you are the only admin of a project, you cannot leave it as each project must have at least one Project Admin at all times.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once you leave a project, your access to the project and associated resources will be revoked.</p>

</Admonition>

