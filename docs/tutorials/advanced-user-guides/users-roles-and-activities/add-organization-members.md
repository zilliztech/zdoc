---
slug: /add-organization-members
sidebar_position: 3
---



# Add Organization Members

This topic describes how to add members to an organization.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization to which you want to add members. For more information on user roles and permissions, see [Roles & Privileges](./roles-privileges).

## Procedure{#procedure}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization to which you want to add members.

1. In the left-side navigation pane, click **Members**. The list of organization users appears.

1. On the page that appears, click **Invite Members** in the upper-right corner.

1. In the **Invite User** dialog box, specify **New User(s)**, **Organization Role**, and **Project Access (Optional)**, and then click **Invite**.

1. The following table describes related parameters.

    |  **Parameter**             |  **Description**                                                                                                                                                                                                                                 |
    | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    |  New User(s)               |  The email address of the user to invite. You can enter one or more email addresses. Each time you enter an email address, press “Enter” to check if the specified value is valid.                                                               |
    |  Organization Role         |  The organization role of the user to invite. Zilliz Cloud supports Organization Owner and Organization Member. For more information on roles and privileges, see [Roles & Privileges](./roles-privileges).                                      |
    |  Project Access (Optional) |  The project that you authorize the user to access. By default, organization members are assigned with permissions on all projects in the organization. If you want them to access only specific projects, include these projects in this field. |

![add-org-members](/img/add-org-members.png)

:::info Notes

Each time you can invite one or more users with the same role to the organization. Each organization can have up to 1,000 members.

:::

## Result{#result}

After the preceding operations are performed, Zilliz Cloud sends an invitation email to each user. Before accepting an invitation, the users who have been invited are in the **Pending** state. Once they accept the invitation, they enter the **Verified** state and join the organization. You can view these members on the list page of organization users.

## Related topics{#related-topics}

- [Organizations & Projects](./organizations-projects) 

- [Roles & Privileges](./roles-privileges) 

- [Remove Members](./remove-members) 

- [Add Project Collaborators](./add-project-collaborators-2) 

- [Manage Organization Information](./manage-organization-information) 

- [View Activities](./view-activities) 
