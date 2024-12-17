---
title: "Manage Organization Users | Cloud"
slug: /organization-users
sidebar_label: "Organization Users"
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, an organization typically represents a company. You can invite employees to your organization and assign them roles based on their job functions. These roles determine the user's access to specific resources and the operations they can perform. For example, developers generally require access to data but do not need billing privileges. | Cloud"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - users

---

import Admonition from '@theme/Admonition';


# Manage Organization Users

In Zilliz Cloud, an organization typically represents a company. You can invite employees to your organization and assign them roles based on their job functions. These roles determine the user's access to specific resources and the operations they can perform. For example, developers generally require access to data but do not need billing privileges. 

This guide explains how to manage organization users, including how to invite users to an organization, revoke or resend invitations, modify the role of an organization user, or remove an organization user.

## Invite a user to your organization{#invite-a-user-to-your-organization}

When inviting a user to your organization, you need to grant a role to the user which defines the access to resources and the privileges to perform certain operations within this organization. 

To invite users, enter the email addresses of the users you wish to invite. Then select the organization role you wish to grant to the new organization users. 

### Organization roles{#organization-roles}

Zilliz Cloud provides three organization roles: **Organization Owner**, **Organization Billing Admin**, and **Organization Member**. These roles cannot be modified or deleted.

The following table lists the corresponding UI and API privileges of each organization role.

<table>
   <tr>
     <th><p><strong>Organization Role</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>UI Privileges</strong></p></th>
     <th><p><strong>RESTful API (V2) Privileges</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization Owner</p></td>
     <td><p>An <strong>Organization Owner</strong> is the top-level role in the Zilliz Cloud which has full privileges to manage an organization and all its resources (projects, clusters, databases, collections). </p><p>This role should be granted only to a limited or controlled number of users in the organization.</p></td>
     <td><ul><li><p>Manage all projects in the organization</p></li><li><p>Manage <a href="./payment-billing">payments & billing</a></p></li><li><p>Manage <a href="./manage-api-keys">API keys</a></p></li><li><p>Manage <a href="./organization-users">organization users</a></p></li><li><p>Manage <a href="./metrics-and-alerts">alerts</a></p></li><li><p>View <a href="./view-activities">activities</a></p></li><li><p>Manage <a href="./organization-settings">organization settings</a></p></li><li><p>Use <a href="./use-recycle-bin">recycle bin</a></p></li><li><p>Plus all the privileges of a <a href="./project-users#project-roles">Project Admin</a> and a <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> roles</p></li></ul></td>
     <td><ul><li><p>Control Plane</p><ul><li><p><a href="/reference/restful/list-cloud-providers-v2">List Cloud Providers</a></p></li><li><p><a href="/reference/restful/list-cloud-regions-v2">List Cloud Regions</a></p></li><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p>List Invoices</p></li><li><p>Get Invoice</p></li><li><p>Query org daily usage</p></li></ul></li><li><p>Data Plane</p><ul><li>All data plane operations</li></ul></li></ul></td>
   </tr>
   <tr>
     <td><p>Organization Billing Admin</p></td>
     <td><p>An <strong>Organization Billing Admin</strong> is a role with the privileges to manage billing in an organization. This role does not have privileges to other data in the organization.</p></td>
     <td><ul><li><p>Manage <a href="./payment-billing">payments & billing</a></p></li><li><p>View <a href="./manage-api-keys">API keys</a></p></li><li><p>Invite <a href="./organization-users">organization users</a></p></li><li><p>View <a href="./organization-settings">organization settings</a></p></li></ul></td>
     <td><ul><li><p>Control Plane</p><ul><li><p>List Invoices</p></li><li><p>Get Invoice</p></li><li><p>Query org daily usage</p></li><li><p>Other control plane privileges are determined by project roles</p></li></ul></li><li><p>Data Plane</p><ul><li>The data plan privileges are determined by project and cluster roles. However, a Billing Admin usually does not require data plane privileges.</li></ul></li></ul></td>
   </tr>
   <tr>
     <td><p>Organization Member</p></td>
     <td><p>An <strong>Organization Member</strong> is a role with the the privileges to view an organization and its resources. Project and cluster level privileges of an Organization Member are dependent on the project and cluster role of this user.</p></td>
     <td><ul><li><p>View <a href="./manage-api-keys">API keys</a></p></li><li><p>Invite <a href="./organization-users">organization users</a></p></li><li><p>View <a href="./organization-settings">organization settings</a></p></li></ul></td>
     <td><ul><li><p>Control Plane</p><ul><li><p><a href="/reference/restful/list-cloud-providers-v2">List Cloud Providers</a></p></li><li><p><a href="/reference/restful/list-cloud-regions-v2">List Cloud Regions</a></p></li><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li></ul></li><li><p>Data Plane</p><ul><li>The data plan privileges are determined by cluster roles</li></ul></li></ul></td>
   </tr>
</table>

Note that if you are an **Organization Member** or an **Organization Billing Admin**, you can only grant invitees the role of **Organization Member**.

The invitees will receive an invitation via email, which must be accepted within 48 hours to join the organization. 

<Admonition type="info" icon="📘" title="Notes">

<p>Each time you can invite one or more users with the same role to the organization. Each organization can have up to 100 users.</p>

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png)

## Revoke or resend an invitation{#revoke-or-resend-an-invitation}

After you invite a user to join your organization, Zilliz Cloud sends an invitation email to the user. You can revoke or resend the invitation before the user accepts it.

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png)

## Edit the role of an organization user{#edit-the-role-of-an-organization-user}

Once a user accepts the invitation and joins your organization, you can adjust their roles according to your needs.

To edit the role of an organization user, you must be an **Organization Owner**.

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

## Remove an organization user{#remove-an-organization-user}

If a user no longer belongs to your organization, you can remove the user.

To remove an organization user, you must be an **Organization Owner**.

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

## Leave an organization{#leave-an-organization}

When you no longer belong to an organization, you have the option to leave it.

Each organization must have at least one organization owner. If you are the only owner of an organization, you cannot leave it.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once you leave an organization, you will no longer be able to access the organization and associated resources.</p>

</Admonition>

You can leave an organization in either of the following ways:

- Leave an organization on the organization list page:

    ![leave-organization](/img/leave-organization.png)

- Enter an organization and leave it on the **Organization Members** page:

    ![leave-organization](/img/leave-organization.png)

