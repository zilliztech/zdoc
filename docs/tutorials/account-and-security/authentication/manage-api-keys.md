---
slug: /manage-api-keys
beta: FALSE
notebook: FALSE
sidebar_position: 1
---



# Manage API Keys

On Zilliz Cloud, every project comes with its own set of API keys, serving as authentication tokens. These keys are pivotal for initiating RESTful API or SDK interactions. Whether you create a new API key for a project or use the default one provided by Zilliz Cloud, you gain access to manage all the clusters and associated resources within that project.

To ensure security, only users with [Owner](./a-panorama-view) status, either at the organization or project level, are allowed to create and oversee these API keys. For more information, see [Users & Roles](./undefined).

## Create an API key{#create-an-api-key}

To create an API key, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

![create-api-key](/img/create-api-key.png)

With your project's API key in hand, you can now connect to any cluster within the project. See [Connect to Cluster](./connect-to-cluster) to explore further details.

## View API keys{#view-api-keys}

To view API keys created for a project, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

:::info Notes

To prevent unauthorized access, you should never share your API keys or store them in publicly accessible locations. If you suspect that your API keys have been compromised, you should immediately delete them and create new ones.

:::

![view-api-keys](/img/view-api-keys.png)

## Delete an API key{#delete-an-api-key}

If an API key is no longer needed, you can delete it.

To delete an API key, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

:::caution Warning

Exercise caution when deleting an API key. Doing so will immediately revoke access to any resources that were using the key.

:::

![delete-api-key](/img/delete-api-key.png)

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Manage Cluster Credentials](./manage-cluster-credentials) 

- [Set up Whitelist](./set-up-whitelist) 

- [Set up a Private Link](./set-up-a-private-link) 
