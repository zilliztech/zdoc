---
slug: /a-panorama-view
beta: FALSE
notebook: FALSE
sidebar_position: 1
---



# A Panorama View

Zilliz Cloud facilitates access control across three distinct scopes:

- Account user

- Organization

- Project

[Unsupported block type]

## Understand organizations{#understand-organizations}

Organizations serve as a means to group projects that share common objectives, such as encompassing all projects under a particular business unit.

In an organization, you can create several projects and manage organization-level resources, including [billing](./undefined), [organization members](./manage-orgs-and-members), [activities](./view-activities), [system settings](./undefined), and [recycle bin](./use-recycle-bin).

[Unsupported block type]

## Understand projects{#understand-projects}

Projects are logical containers within an organization that group clusters and other associated resources.

In a project, you can create several clusters and manage cluster-level resources, including [project collaborators](./manage-projects-and-collaborator), [API keys](./manage-api-keys), [security](./undefined), and [monitoring](./undefined).

[Unsupported block type]

## Organization roles{#organization-roles}

To manage access and actions at the organization level, Zilliz Cloud introduces two organization roles, delineating who can access which modules and perform specified actions.

- **Organization Owner**: has full administration access to the organization, including organization settings, all projects in the organization, and associated resources.

- **Organization Member**: has limited access to the organization, where they can view organization settings and invite users to join the organization. The specific scope of permission on project- and cluster-level resources owned by an organization member is determined by their project roles.

## Project roles {#project-roles}

At the project level, two roles are introduced to enable finer-grained access control:

- **Project Owner**: has full administration access to the project, including project settings, all clusters in the project, and associated resources.

- **Project Member**: has read and write access to the project, where they can view cluster details and manage collections and indexes.

## Access levels{#access-levels}

|  Category                                                                                             |  Access                                                         |  Organization Owner |  Project Owner  |  Project Member |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------- | --------------- | --------------- |
|  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  Organization<br/> <br/>   |  Managing projects (create, rename, delete)                     |  Yes                |  No             |  No             |
|                                                                                                       |  Managing organization members                                  |  Yes                |  No             |  No             |
|                                                                                                       |  Billing                                                        |  Yes                |  No             |  No             |
|                                                                                                       |  Recycle bin                                                    |  Yes                |  No             |  No             |
|                                                                                                       |  Managing system settings (edit, delete)                        |  Yes<br/> <br/>       |  No             |  No             |
|                                                                                                       |  Viewing activities                                             |  Yes<br/> <br/>       |  No             |  No             |
|                                                                                                       |  Other (docs, support, account settings)                        |  Yes<br/> <br/>       |  Yes            |  Yes            |
|  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  Project                                                  |  Managing project collaborators                                 |  Yes                |  Yes            |  No             |
|                                                                                                       |  Security<br/> <br/>  - Whitelists<br/> <br/>  - Private links<br/>  |  Yes                |  Yes<br/> <br/>   |  No             |
|                                                                                                       |  API keys                                                       |  Yes                |  Yes            |  No             |
|                                                                                                       |  Playground                                                     |  Yes                |  Yes            |  Yes            |
|                                                                                                       |  Monitoring                                                     |  Yes                |  Yes            |  No             |
|  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  <br/> <br/>  Cluster                 |  Connection                                                     |  Yes                |  Yes            |  Yes            |
|                                                                                                       |  Managing clusters (create, suspend, drop, upgrade, scale)      |  Yes                |  Yes            |  No             |
|                                                                                                       |  Backup, restore, migration                                     |  Yes                |  Yes            |  No             |
|                                                                                                       |  Viewing cluster details and metrics                            |  Yes                |  Yes            |  Yes            |
|                                                                                                       |  Managing collections (create, import, delete, release)         |  Yes                |  Yes            |  Yes            |
|                                                                                                       |  Managing indexes (create, drop)                                |  Yes                |  Yes            |  Yes            |
|                                                                                                       |  Managing cluster users (create, drop)                          |  Yes                |  Yes            |  No             |

## Related topics{#related-topics}

- [Manage Organizations and Members](./manage-orgs-and-members)

- [Delete Your Organization](./delete-your-org)

- [Manage Projects and Collaborators](./manage-projects-and-collaborator)
