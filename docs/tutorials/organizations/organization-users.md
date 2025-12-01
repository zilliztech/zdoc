---
title: "Manage Organization Users | Cloud"
slug: /organization-users
sidebar_label: "Organization Users"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
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
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';


# Manage Organization Users

In Zilliz Cloud, an organization typically represents a company. You can invite employees to your organization and assign them roles based on their job functions. These roles determine the user's access to specific resources and the operations they can perform. For example, developers generally require access to data but do not need billing privileges. 

This guide explains how to manage organization users, including how to invite users to an organization, revoke or resend invitations, modify the role of an organization user, or remove an organization user.

## Invite a user to your organization\{#invite-a-user-to-your-organization}

When inviting a user to your organization, you need to grant a role to the user which defines the access to resources and the privileges to perform certain operations within this organization. 

To invite users, enter the email addresses of the users you wish to invite. Then select the organization role you wish to grant to the new organization users. 

### Organization roles\{#organization-roles}

Zilliz Cloud provides three organization roles. These roles cannot be modified or deleted.

- **Organization Owner**: An Organization Owner is the top-level role in the Zilliz Cloud which has full privileges to manage an organization and all its resources (projects, clusters, databases, collections). This role should be granted only to a limited or controlled number of users in the organization.

    The following table lists the corresponding UI and API privileges of this organization role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>Manage all projects in the organization</p></li><li><p>Manage <a href="./payment-billing">payments & billing</a></p></li><li><p>Manage <a href="./manage-api-keys">API keys</a></p></li><li><p>Manage <a href="./organization-users">organization users</a></p></li><li><p>Manage <a href="./metrics-and-alerts">alerts</a></p></li><li><p>View <a href="./view-activities">activities</a></p></li><li><p>Manage <a href="./organization-settings">organization settings</a></p></li><li><p>Use <a href="./use-recycle-bin">recycle bin</a></p></li><li><p>Plus all the privileges of a <a href="./project-users#project-roles">Project Admin</a> and a <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> roles</p></li></ul></td>
         <td><p><a href="/reference/restful/control-plane-v2">All control plane operations</a></p></td>
         <td><p><a href="/reference/restful/data-plane-v2">All data plane operations</a></p></td>
       </tr>
    </table>

- **Organization Billing Admin**: An Organization Billing Admin is a role with the privileges to manage billing in an organization. This role does not have privileges to other data in the organization.

    The following table lists the corresponding UI and API privileges of this organization role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>Manage <a href="./payment-billing">payments & billing</a></p></li><li><p>View <a href="./manage-api-keys">API keys</a></p></li><li><p>Invite <a href="./organization-users">organization users</a></p></li><li><p>View <a href="./organization-settings">organization settings</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/list-invoices-v2">List Invoices</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">Describe Invoice</a></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">Query Daily Usage</a></p></li></ul></td>
         <td><p>The data plan privileges are determined by project and cluster roles. However, a Billing Admin usually does not require data plane privileges.</p></td>
       </tr>
    </table>

- **Organization Member**: An Organization Member is a role with the the privileges to view an organization and its resources. Project and cluster level privileges of an Organization Member are dependent on the project and cluster role of this user.

    The following table lists the corresponding UI and API privileges of this organization role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>View <a href="./manage-api-keys">API keys</a></p></li><li><p>Invite <a href="./organization-users">organization users</a></p></li><li><p>View <a href="./organization-settings">organization settings</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">All cloud meta operations</a></p></li><li><p>Part of cluster operations</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>Part of import operations</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>Part of backup &amp; restore operations</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">All cloud job operations</a></p></li></ul></td>
         <td><p>The data plan privileges are determined by <a href="./project-users#project-roles">project</a> and <a href="./cluster-roles">cluster</a> roles</p></td>
       </tr>
    </table>

Note that if you are an **Organization Member** or an **Organization Billing Admin**, you can only grant invitees the role of **Organization Member**.

The invitees will receive an invitation via email, which must be accepted within 48 hours to join the organization. Alternatively, you can also copy the invitation link from the web console and share it with the invitees.

<Admonition type="info" icon="📘" title="Notes">

<p>Each time you can invite one or more users with the same role to the organization. Each organization can have up to 100 users.</p>

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png "invite-user-to-org")

## Revoke or resend an invitation\{#revoke-or-resend-an-invitation}

After you invite a user to join your organization, Zilliz Cloud sends an invitation email to the user. You can revoke or resend the invitation before the user accepts it.

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png "revoke-or-resend-org-invitation")

## Edit the role of an organization user\{#edit-the-role-of-an-organization-user}

Once a user accepts the invitation and joins your organization, you can adjust their roles according to your needs.

To edit the role of an organization user, you must be an **Organization Owner**.

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png "edit-user-role-or-remove-org-user")

## Remove an organization user\{#remove-an-organization-user}

If a user no longer belongs to your organization, you can remove the user.

To remove an organization user, you must be an **Organization Owner**.

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png "edit-user-role-or-remove-org-user")

## Leave an organization\{#leave-an-organization}

When you no longer belong to an organization, you have the option to leave it.

Each organization must have at least one organization owner. If you are the only owner of an organization, you cannot leave it.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once you leave an organization, you will no longer be able to access the organization and associated resources.</p>

</Admonition>

You can leave an organization in either of the following ways:

- Leave an organization on the organization list page:

    ![leave-organization](/img/leave-organization.png "leave-organization")

- Enter an organization and leave it on the **Organization Members** page:

    ![leave-organization](/img/leave-organization.png "leave-organization")

