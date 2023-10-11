---
slug: /remove-members
sidebar_position: 4
---



# Remove Members

This topic describes how to remove members.

When you invite a user to an organization, Zilliz Cloud sends an invitation email to the user. Before accepting invitation, the user who has been invited is in the **Pending** state. Once accepting invitation, the user enters the **Verified** state and join the organization. Therefore, there are two circumstances when you remove members from organizations:

- [Revoke invitation before the user accepts it](./remove-members#revoke-invitation)

- [Remove a member who has accepted invitation](./remove-members#remove-a-member-who-has-accepted-the-invitation)

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization to which you want to add members. For more information on user roles and permissions, refer to [Roles & Privileges](./roles-privileges).

## Revoke invitation{#revoke-invitation}

Before a user accepts the invitation, you can follow these steps to revoke it:

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization from which you want to remove members.

1. In the left-side navigation pane, click **Members**.

1. Find the target user who is in the **Pending** state, click the More icon in the **Actions** column, and then select **Revoke Invitation**.

1. In the dialog box that appears, click **Yes** to confirm the operation.

![remove-members-1](/img/remove-members-1.png)

## Remove a member who has accepted the invitation{#remove-a-member-who-has-accepted-the-invitation}

If a user has already accepted the invitation, you can follow these steps to remove the user from the organization:

1. Follow the first three steps in [Revoke invitation](https://www.notion.so/Remove-Members-b3adcde8f3aa47dda6cc31aa71f751d7?pvs=21).

1. Find the target user who is in the **Verified** state, click the More icon in the **Actions** column, and then select **Remove** from the drop-down list.

1. In the dialog box that appears, click **Yes** to confirm the operation.

![remove-members-2](/img/remove-members-2.png)

## Result{#result}

After the preceding operations are performed, Zilliz Cloud sends an email notification to the user who has been removed. You can also verify the result on the list page of organization users.

## Related topics{#related-topics}

- [Organizations & Projects](./organizations-projects) 

- [Roles & Privileges](./roles-privileges) 

- [the Add Organization Members](./add-organization-members) 

- [Add Project Collaborators](./add-project-collaborators-2) 

- [Manage Organization Information](./manage-organization-information) 

- [View Activities](./view-activities) 
