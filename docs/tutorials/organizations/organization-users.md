---
title: "Manage Organization Users | Cloud"
slug: /organization-users
sidebar_key: organization-users
sidebar_label: "Organization Users"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, an organization typically represents a company. You can invite employees to your organization and assign them roles based on their job functions. These roles determine the user's access to specific resources and the operations they can perform. For example, developers typically need access to data but do not require billing privileges. | Cloud"
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

In Zilliz Cloud, an organization typically represents a company. You can invite employees to your organization and assign them roles based on their job functions. These roles determine the user's access to specific resources and the operations they can perform. For example, developers typically need access to data but do not require billing privileges. 

This guide explains how to manage organization users, including inviting users to an organization, revoking or resending invitations, modifying an organization user's role, or removing an organization user.

## Invite a user to your organization\{#invite-a-user-to-your-organization}

When inviting a user to your organization, you need to assign a role that defines access to resources and the privileges to perform specific operations within the organization. 

To invite users, enter the email addresses of the users you wish to invite. Then select the organization role you wish to grant to the new organization users. 

### Organization Owner\{#organization-owner}

An Organization Owner is the top-level role in the Zilliz Cloud, which has full privileges to manage an organization and all its resources (projects, clusters, databases, collections). This role should be granted only to a limited number of users within the organization.

The following table lists the corresponding UI and API privileges of this organization role.

<table>
   <tr>
     <th><p><strong>UI Privileges</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>Manage all projects in the organization</p></li><li><p>Manage <a href="./payment-billing">payments & billing</a></p></li><li><p>Manage <a href="./manage-api-keys">API keys</a></p></li><li><p>Manage <a href="./organization-users">organization users</a></p></li><li><p>Manage <a href="./metrics-and-alerts">alerts</a></p></li><li><p>View <a href="./view-activities">activities</a></p></li><li><p>Manage <a href="./organization-settings">organization settings</a></p></li><li><p>Use <a href="./use-recycle-bin">recycle bin</a></p></li><li><p>Plus all the privileges of a <a href="./project-users#project-admin">Project Admin</a> and a <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> roles</p></li></ul></td>
     <td><p><a href="/reference/restful/control-plane-v2">All control plane operations</a></p></td>
     <td><p><a href="/reference/restful/data-plane-v2">All data plane operations</a></p></td>
   </tr>
</table>

### Organization Billing Admin\{#organization-billing-admin}

An Organization Billing Admin role has the privileges to manage billing in an organization. This role does not have privileges to other data in the organization.

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

### Organization Role\{#organization-role}

You can create an organization role for the invitation recipients. An organization role is a role with the privilege to view an organization and its resources. You can edit project- and cluster-level privileges for the role.

![Cb5Yw6EWNhdqD5bjxTRcHHF1nAd](https://zdoc-images.s3.us-west-2.amazonaws.com/Cb5Yw6EWNhdqD5bjxTRcHHF1nAd.png)

#### Customize project privileges\{#customize-project-privileges}

By default, **Project Admin** access to **Default Project** is granted to the invitation recipients. However, you can select **Customize** to grant fine-grained privileges.

![PXLywcZSyh9Vaib1wUFc0NminUd](https://zdoc-images.s3.us-west-2.amazonaws.com/PXLywcZSyh9Vaib1wUFc0NminUd.png)

- **Cluster Access**

    By default, access is granted to **All Clusters** with the **Include all future clusters** option enabled. You can assign a role, such as **Read-Write***,* to define the invited user's permissions across these clusters. Once the invitation is accepted, the user will have the specified privileges on all current and future clusters within the project. 

    To limit access, select specific clusters from the dropdown. You can also disable the **Include all future clusters** option to exclude newly created clusters from the access scope.

    Click **+ Cluster Access** to add more cluster access policies.

- **Volume Access**

    By default, access is granted to **All Volumes** with the **Include all future volumes** option enabled. You can assign a role, such as **Read-Write***,* to define the invited user's permissions across these volumes. Once the invitation is accepted, the user will have the specified privileges on all current and future volumes within the project. 

    To limit access, select specific volumes from the dropdown. You can also disable the **Include all future volumes** option to exclude newly created volumes from the access scope.

    Click **+ Volume Access** to add more cluster access policies.

The following table lists the UI and API privileges granted to the invitees for this role at the organization level.

<table>
   <tr>
     <th><p><strong>UI Privileges</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>View <a href="./manage-api-keys">API keys</a></p></li><li><p>Invite <a href="./organization-users">organization users</a></p></li><li><p>View <a href="./organization-settings">organization settings</a></p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">All cloud meta operations</a></p></li><li><p>Part of cluster operations</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>Part of import operations</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>Part of backup & restore operations</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">All cloud job operations</a></p></li></ul></td>
     <td><p>The data plan privileges are determined by <a href="./project-users#invite-a-user-to-a-project">project</a> and <a href="./cluster-roles">cluster</a> roles</p></td>
   </tr>
</table>

Note that if you are an **Organization Member** or an **Organization Billing Admin**, you can only grant invitation recipients the role of **Organization Member**.

Invitation recipients will receive an email invitation that must be accepted within 48 hours to join the organization. Alternatively, you can copy the invitation link from the web console and share it with the invitees.

<Admonition type="info" icon="📘" title="Notes">

<p>Each time, you can invite one or more users with the same role to the organization. Each organization can have up to 100 users.</p>

</Admonition>

## Revoke or resend an invitation\{#revoke-or-resend-an-invitation}

After you invite a user to join your organization, Zilliz Cloud sends an invitation email to the user. You can revoke or resend the invitation before the user accepts it.

![NDXHw6PVFhyxntbucxbc9SOFnLg](https://zdoc-images.s3.us-west-2.amazonaws.com/NDXHw6PVFhyxntbucxbc9SOFnLg.png)

## Edit the role of an organization user\{#edit-the-role-of-an-organization-user}

Once a user accepts the invitation and joins your organization, you can adjust their roles as needed.

To edit an organization user's role, you must be an **Organization Owner**.

![VGxOwarfShUDk1bIoEpc5wf3nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/VGxOwarfShUDk1bIoEpc5wf3nFf.png)

## Remove an organization user\{#remove-an-organization-user}

If a user no longer belongs to your organization, you can remove the user.

To remove an organization user, you must be an **Organization Owner**.

<Admonition type="info" icon="📘" title="Notes">

<p>Upon removing a member, the corresponding personal API key will be immediately revoked and access will be denied. To prevent service disruption, please ensure that any personal keys utilized in your environments are replaced prior to removal. This action cannot be undone.</p>

</Admonition>

![C6O0wzlfRhmxQwbt7yccX3VHn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/C6O0wzlfRhmxQwbt7yccX3VHn3g.png)

## Leave an organization\{#leave-an-organization}

When you no longer belong to an organization, you have the option to leave it.

Each organization must have at least one organization owner. If you are the only owner of an organization, you cannot leave it.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once you leave an organization, you will no longer be able to access the organization and associated resources.</p>

</Admonition>

You can leave an organization in either of the following ways:

- Leave an organization on the organization list page:

    ![Jdu2wpIYBhNZ5mbdMKOcBB6rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/Jdu2wpIYBhNZ5mbdMKOcBB6rnBg.png)

- Enter an organization and leave it on the **Organization Members** page:

    ![YQYsw1BYahoLHabbmXdc4V15nA8](https://zdoc-images.s3.us-west-2.amazonaws.com/YQYsw1BYahoLHabbmXdc4V15nA8.png)

