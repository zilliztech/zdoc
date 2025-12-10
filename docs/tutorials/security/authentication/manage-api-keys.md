---
title: "API Keys | Cloud"
slug: /manage-api-keys
sidebar_label: "API Keys"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "API keys are used to authenticate users or applications making API or SDK calls to access Zilliz Cloud control plane and data plane resources. An API key is an alphanumeric string with its own properties, such as a name and an ID. | Cloud"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - api key
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


# API Keys

API keys are used to authenticate users or applications making API or SDK calls to access Zilliz Cloud control plane and data plane resources. An API key is an alphanumeric string with its own properties, such as a name and an ID.

## Overview of API keys\{#overview-of-api-keys}

Zilliz Cloud offers two types of API keys to meet diverse user requirements:

- **Personal API keys**: Automatically generated upon user registration, each key is linked to the user’s account and inherits the privileges of the user’s role within the organization and project that the user belongs to. If the account user leaves the organization, the associated personal key is automatically deleted. As an [Organization Owner](./organization-users#organization-roles) or a [Project Admin](./project-users#project-roles), you can see two types of personal API keys on the Zilliz Cloud web console:

    - **Your own personal API key**: A personal key that belongs exclusively to you. You can view and copy this API key.

    - **Member's personal API key**: A list of existing personal keys that belong to other users in the organization or project. You can only view the names and IDs of these keys but not the keys themselves.

- **Customized API keys**: Manually created by **Organization Owners** and **Project Admins** for applications or external users without Zilliz Cloud accounts. These keys are ideal for long-term access needs, ensuring service continuity even if the initial creator of the API key leaves the organization.

The following diagram illustrates API Key roles and resource access.

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

The table below details the access scope of API keys based on assigned roles. For more information about roles and privileges, see [Access Control](./access-control).

<table>
   <tr>
     <th colspan="2"><p><strong>API Key Role</strong></p></th>
     <th><p><strong>Access Level</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Owner</p></td>
     <td><p>Full admin access to all resources within the organization, including projects, clusters, and volumes.</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Billing Admin</p></td>
     <td><p>Admin access to organization billing only. No access to projects, clusters, and volumes within the organization.</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Organization Member</p></td>
     <td><p>Project Admin</p></td>
     <td><p>Full admin access to specified projects and full admin access to all clusters and volumes within the projects by default.</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Write</p></td>
     <td><p>Read and write access to specified projects as well as read and write access to all clusters and volumes within the projects by default.</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Only</p></td>
     <td><p>Read-only access to specified projects as well as read-only access to all clusters and volumes within the projects by default.</p></td>
   </tr>
</table>

### Limits and restrictions\{#limits-and-restrictions}

- Each organization can contain a maximum of 100 customized API keys.

- The management permissions for API keys are influenced by the user's roles within the organization and project. Specific permissions are outlined as follows:

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>Organization Owner</strong></p></th>
         <th rowspan="2"><p><strong>Organization Billing Admin</strong></p></th>
         <th colspan="3"><p><strong>Organization Member</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Project Admin</strong></p></td>
         <td><p><strong>Project Read-Write</strong></p></td>
         <td><p><strong>Project Read-Only</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>Your Own Personal API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>Create</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
       </tr>
       <tr>
         <td><p>View and copy</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>Edit</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Reset</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>Delete</p></td>
         <td><p>Auto deleted when user leaves the organization</p></td>
         <td><p>Auto deleted when user leaves the organization</p></td>
         <td><p>Auto deleted when user leaves the organization</p></td>
         <td><p>Auto deleted when user leaves the organization</p></td>
         <td><p>Auto deleted when user leaves the organization</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>Members' Personal API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>Create</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
         <td><p>Auto generated</p></td>
       </tr>
       <tr>
         <td><p>View names and IDs</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Copy</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Edit</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Reset</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Delete</p></td>
         <td><p>Auto deleted when member leaves the organization</p></td>
         <td><p>Auto deleted when member leaves the organization</p></td>
         <td><p>Auto deleted when member leaves the organization</p></td>
         <td><p>Auto deleted when member leaves the organization</p></td>
         <td><p>Auto deleted when member leaves the organization</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>Customized API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>Create</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>View and copy</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Edit</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Reset</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Delete</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## Create an API key\{#create-an-api-key}

Apart from personal keys that are automatically generated by Zilliz Cloud for each organization user, you can create customized keys. Only **Organization Owners** and **Project Admins** can create customized API keys.

1. Navigate to the organization's **API Keys** page. Click **+ API Key**.

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. Enter the **API Key Name** and configure the **API Key Access**.

    ![Nwd5bLDAuolLrUxo8nWcAHU5nub](https://zdoc-images.s3.us-west-2.amazonaws.com/nwd5bldauollruxo8nwcahu5nub.png "Nwd5bLDAuolLrUxo8nWcAHU5nub")

    - **API Key Name:** The name should not exceed 64 characters.

    - **API Key Access**: Define the access scope for the current customized API key by assigning the appropriate organization and project roles. For more fine-grained access control, you can limit the clusters and volumes that the key can access by checking **Restrict Access to Specific Clusters and Volumes**.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For <a href="./project-users">Project Admins</a>, the permissions that this user can grant to an API key are limited to the user's own permission scope. </p>

        </Admonition>

## View API keys\{#view-api-keys}

Navigate to the organization's **API Keys** page. Your view may vary based on your specific [role](./manage-api-keys#limits-and-restrictions).

- As an **Organization Owner**, you can view your own personal key, all members' personal keys, and all customized keys.

- As a **Project Admin**, you can view your own personal key, members' personal keys and customized keys that fall within your permission scope. For example, if *User 1* is only the Project Admin of *Project A* and *Key 1* has Admin access to *Projects A*, *B*, and *C*, *Key 1* will not be visible to *User 1* since its access scope goes beyond *User 1*'s permissions.

- As an **Organization Billing Admin**, a **Project Read-Write**, or a **Project Read-Only**, you can only view your own personal API key.

The screenshot below displays the **Organization Owner**'s view of the API keys.

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## Edit an API key\{#edit-an-api-key}

Currently, you can only edit a customized API key. Personal keys cannot be edited because they are tied to an account user. To modify the access scope of a personal key, you need to first adjust the user's organization and project roles. Any changes to the user's role will automatically reflect in the key's access permissions.

The instructions below explains how to edit a customized API key.

1. Navigate to the organization's **API Keys** page. Click **...** in the actions column and click **Edit**.

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. Edit the API Key **API Key Name** and the **API Key Access**.

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **API Key Name:** The name should not exceed 64 characters.

    - **API Key Access**:  Define the access scope for the current customized API key by assigning the appropriate organization and project roles. For more fine-grained access control, you can limit the clusters and volumes that the key can access by checking **Restrict Access to Specific Clusters and Volumes**.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For <a href="./project-users">Project Admins</a>, the permissions that this user can grant to an API key are limited to the user's own permission scope. </p>

        </Admonition>

## Reset an API key\{#reset-an-api-key}

If you believe a personal or customized API key is compromised, you should immediately reset it. 

<Admonition type="caution" icon="🚧" title="Warning">

<p>This operation will reset and invalidate the current API key. Any application code using this key will stop functioning until you update the relevant code with the new key value.</p>

</Admonition>

Depending on the type of key, the process varies:

- **Reset personal API keys**: you can reset your own personal API key only, regardless of your roles. 

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **Reset customized API keys**: Only Organization Owners and Project Admins can reset customized API keys.

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## Delete an API key\{#delete-an-api-key}

If a customized API key is no longer in use, you should delete it as soon as possible. Only **Organization Owners** and **Project Admins** can delete customized API keys.

Personal key cannot be manually deleted. However, they will be automatically invalidated and removed when the corresponding user leaves the organization. 

The following screenshots demonstrate how to delete a customized API key.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Deleting an API key will irreversibly terminate access to Zilliz Cloud resources for any services using that key.</p>

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

