---
slug: /manage-api-keys
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Manage API Keys

On Zilliz Cloud, every project comes with its own set of API keys, serving as authentication tokens. These keys are pivotal for initiating RESTful API or SDK interactions. Whether you create a new API key for a project or use the default one provided by Zilliz Cloud, you gain access to manage all the clusters and associated resources within that project.

To ensure security, only users with [Owner](./a-panorama-view) status, either at the organization or project level, are allowed to create and oversee these API keys. For more information, see [Users & Roles](https://docs.zilliz.com/docs/users-and-roles).

## Comparative overview: API keys vs username and password pairs{#comparative-overview-api-keys-vs-username-and-password-pairs}

The following table compares API keys and username and password pairs, highlighting their scope, ease of use, creation, and management in accessing resources.

|  Feature                                 |  API Keys                                                                                               |  Username and Password Pairs                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
|  **Usage Scope**                         |  - Project-level resources;<br/> <br/>  - Manage all clusters and associated resources in a project.<br/>  |  - Cluster-level resources; <br/> <br/>  - Manage collections and associated resources in a cluster.<br/>                               |
|  **Authentication**                      |  Authenticate RESTful API or SDK calls.                                                                 |  Authenticate RESTful API or SDK calls.                                                                                              |
|  **Ease of Use**                         |  - User-friendly with a lower learning curve;<br/> <br/>  - No need to manage SDK versions.<br/>           |  - Suited for advanced features, role-based access control (RBAC) for cluster users;<br/> <br/>  - Require managing SDK versions.<br/>  |
|  **Creation**                            |  Create API keys on the project page.                                                                   |  Add cluster users on the cluster management page.                                                                                   |
|  **Management of Collections/Resources** |  - Create, drop collections;<br/> <br/>  - Manage indexes.<br/>                                            |  - Create, drop collections; <br/> <br/>  - Manage indexes;<br/> <br/>  - Access advanced collection features.<br/>                       |

## Create an API key{#create-an-api-key}

To create an API key, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

![create-api-key](/img/create-api-key.png)

With your project's API key in hand, you can now connect to any cluster within the project. See [Connect to Cluster](./connect-to-cluster) to explore further details.

## View API keys{#view-api-keys}

To view API keys created for a project, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

<Admonition type="info" icon="📘" title="Notes">

To prevent unauthorized access, you should never share your API keys or store them in publicly accessible locations. If you suspect that your API keys have been compromised, you should immediately delete them and create new ones.

</Admonition>

![view-api-keys](/img/view-api-keys.png)

## Delete an API key{#delete-an-api-key}

If an API key is no longer needed, you can delete it.

To delete an API key, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

<Admonition type="caution" icon="🚧" title="Warning">

Exercise caution when deleting an API key. Doing so will immediately revoke access to any resources that were using the key.

</Admonition>

![delete-api-key](/img/delete-api-key.png)

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Manage Cluster Credentials](./manage-cluster-credentials) 

- [Set up Whitelist](./set-up-whitelist) 

- [Set up a Private Link](./set-up-a-private-link) 
