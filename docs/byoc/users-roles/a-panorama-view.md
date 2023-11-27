---
displayed_sidebar: paasSidebar
slug: /docs/byoc/a-panorama-view
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# A Panorama View

Zilliz Cloud facilitates access control across three distinct scopes:

- Account user

- Organization

- Project

![a-panorama-view-1](/byoc/a-panorama-view-1.png)

## Understand organizations{#understand-organizations}

Organizations serve as a means to group projects that share common objectives, such as encompassing all projects under a particular business unit.

The **Default Organization**, operating with the BYOC license, will be labeled as **BYOC** in the web console for clarity and ease of management.

In an organization, you can create several projects and manage organization-level resources, including [license](./license), [organization members](./manage-orgs-and-members), [activities](./view-activities), [organization settings](https://docs.zilliz.com/docs/organization-settings), and [recycle bin](./use-recycle-bin).

![paas-a-panorama-view-2](/byoc/paas-a-panorama-view-2.png)

## Understand projects{#understand-projects}

Projects are logical containers within an organization that group clusters and other associated resources.

In a project, you can create several clusters and manage cluster-level resources, including [project collaborators](./manage-projects-and-collaborator), [API keys](./manage-api-keys), [security](https://docs.zilliz.com/docs/security), and [monitoring](https://docs.zilliz.com/docs/monitors-metrics).

![a-panorama-view-3](/byoc/a-panorama-view-3.png)

## Organization roles{#organization-roles}

To manage access and actions at the organization level, Zilliz Cloud introduces two organization roles, delineating who can access which modules and perform specified actions.

- **Organization Owner**: has full administration access to the organization, including organization settings, all projects in the organization, and associated resources.

- **Organization Member**: has limited access to the organization, where they can view organization settings and invite users to join the organization. The specific scope of permission on project- and cluster-level resources owned by an organization member is determined by their project roles.

## Project roles {#project-roles}

At the project level, two roles are introduced to enable finer-grained access control:

- **Project Owner**: has full administration access to the project, including project settings, all clusters in the project, and associated resources.

- **Project Member**: has read and write access to clusters within the project, where they can view cluster details and manage collections and indexes.

## Access levels{#access-levels}

|  Permission / Access Level                                                                                                          |  Organization Owner       |  Project Owner            |  Project Member |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------- | --------------- |
|  **Organization Level**                                                                                                             |                           |                           |                 |
|  Managing projects                                                                                                                  |  ✔︎                       |  ✘                        |  ✘              |
|  Managing organization members                                                                                                      |  ✔︎                       |  ✘                        |  ✘              |
|  License                                                   |  ✔︎<br/> <br/>              |  ✘                        |  ✘              |
|  Recycle bin                                                                                                                        |  ✔︎                       |  ✘                        |  ✘              |
|  Managing system settings                                                                                                           |  ✔︎                       |  ✘                        |  ✘              |
|  Viewing activities                                                                                                                 |  ✔︎                       |  ✘                        |  ✘              |
|  Monitoring                                                                                                                         |  ✔︎                       |  ✔︎                       |  ✔︎             |
|  Other (docs, support, account settings)                                                                                            |  ✔︎                       |  ✘                        |  ✘              |
|  **Project Level**                                                                                                                  |                           |                           |                 |
|  Managing project collaborators                                                                                                     |  ✔︎                       |  ✔︎                       |  ✘              |
|  Managing security settings<br/> <br/>  - Whitelists<br/> <br/>   |  <br/> <br/>  ✔︎<br/> <br/>   |  <br/> <br/>  ✔︎<br/> <br/>   |  <br/> <br/>  ✘   |
|  Managing API keys                                                                                                                  |  ✔︎                       |  ✔︎                       |  ✘              |
|  Playground                                                                                                                         |  ✔︎                       |  ✔︎                       |  ✔︎             |
|  **Cluster Level**                                                                                                                  |                           |                           |                 |
|  Managing clusters                                                                                                                  |  ✔︎                       |  ✔︎                       |  ✘              |
|  Backup, restore, migration                                                                                                         |  ✔︎                       |  ✔︎                       |  ✘              |
|  Managing cluster users                                                                                                             |  ✔︎                       |  ✔︎                       |  ✘              |
|  Connection                                                                                                                         |  ✔︎                       |  ✔︎                       |  ✔︎             |
|  Viewing cluster details and metrics                                                                                                |  ✔︎                       |  ✔︎                       |  ✔︎             |
|  Managing collections                                                                                                               |  ✔︎                       |  ✔︎                       |  ✔︎             |
|  Managing indexes                                                                                                                   |  ✔︎                       |  ✔︎                       |  ✔︎             |

*Here, "✔︎" indicates that the user role has permission for the specific task.*

## Related topics{#related-topics}

- [Manage Organizations and Members](./manage-orgs-and-members)

- [Manage Projects and Collaborators](./manage-projects-and-collaborator)
