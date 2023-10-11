---
slug: /manage-api-keys
sidebar_position: 1
---



# Manage API Keys

API keys are a crucial component of accessing resources on Zilliz Cloud. API keys are unique identifiers used to authenticate and authorize requests made to the clusters on Zilliz Cloud. To manage your API keys, you can access the Zilliz Cloud console and navigate to the **API Keys** page. From here, you can create, view, and delete API keys.

This topic describes how to manage API keys.

## Create an API key{#create-an-api-key}

### Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization or project in which you want to create an API key. For more information on roles and permissions, see [Roles & Privileges](./roles-privileges).

- In the organization to which you belong, a project has been created.

### Procedure{#procedure}

To create an API key, follow these steps:

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization and project where you want to create an API key.

1. In the left-side navigation pane of the project homepage, click **API Keys**.

1. On the page that appears, click **+ API Key**.

1. In the dialog box that appears, specify **Name** and click **Create**. The name can contain lowercase letters, numbers, and hyphens with a maximum of 64 characters.

![create-api-key](/img/create-api-key.png)

## View API keys{#view-api-keys}

Once you join a project, you can view the API keys created in the project.

To view API keys, follow these steps:

1. In the left-side navigation pane of the project homepage, click **API Keys**.

1. Find the target API key and click the Show or Copy icon to view the API key in plain text or copy it.

:::info Notes

It’s essential to keep your API keys safe and secure. To prevent unauthorized access, you should never share your API keys or store them in publicly accessible locations. If you suspect that your API keys have been compromised, you should immediately revoke them and generate new ones.

:::

![view-api-keys](/img/view-api-keys.png)

## Delete an API key{#delete-an-api-key}

If you are an organization or project owner, you can follow these steps to delete an API key that is no longer needed:

1. In the left-side navigation pane of the project homepage, click **API Keys**.

1. Find the target API key, click the … icon in the **Actions** column, and then select **Delete**.

1. In the dialog box that appears, enter the name of the API key to confirm the operation and click **Delete**.

:::caution Warning

Exercise caution when deleting an API key. Doing so will immediately revoke access to any resources that were using the key. Before deleting a key, verify that it is no longer needed.

:::

![delete-api-key](/img/delete-api-key.png)

## Related topics{#related-topics}

- [Manage Cluster Credentials](./manage-cluster-credentials) 

- [Set up Whitelist](./set-up-whitelist) 

- [Set up a Private Link](./set-up-a-private-link) 
