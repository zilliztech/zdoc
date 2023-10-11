---
slug: /roles-privileges
sidebar_position: 2
---



# Roles & Privileges

Zilliz Cloud provides access control for governing user privileges. Users can be granted different roles that determine their access levels to cluster resources and related operations. Outside the scope of privileges, they have no access to specific resources.

## Organizations and projects{#organizations-and-projects}

Zilliz Cloud uses organizations and projects for access control and logical separation of resources.

An organization is the highest level of abstraction within Zilliz Cloud services. It contains projects and members. In most cases, an organization represents a real-world company or other types of isolated grouping units.

Within an organization, each project provides a silo of data, which can represent a development team or unit within a company. Users in a project can create one or more Zilliz Cloud clusters, and all queries or searches are specific to that project.

## Roles and privileges{#roles-and-privileges}

Roles grant users different privileges to access resources and perform operations specific to organizations and projects. The scope of each privilege's effect is determined by the type of role.

Currently, there are two types of organizational roles:

- **Organization Owner**: This type of role is assigned to the creator of an organization and users who are granted the Owner role by another Organization Owner. Each Owner has full control over the organization, including the ability to invite or remove members, update existing member roles or privileges, and [Manage Organization Information](./manage-organization-information).

- **Organization Member**: This type of role is assigned to users who are granted the Member role by an Organization Owner. Each Member has read-only access to the organization, where they can view organization settings, but have no permission to invite or remove members or update existing member roles or privileges.

## Access levels{#access-levels}

Regarding project-level access, there are no limits on Organization Owners. That being said, Organization Owners have full control over all projects in the organization, including viewing and managing project settings, clusters, and collections.

However, the access levels for Organization Members vary depending on the projects they are authorized to access. When inviting users to join an organization with the Member role, you can limit their access to specific projects, rather than grant them access to all projects in that organization. Note that when authorizing Organization Members to access specific projects, they become owners of these projects and have full access to the resources specific to these projects, including clusters, collections, and project collaborators.

See access levels for each role below.

|  **Access**                                          |  **Organization Owner**                                                               |  **Organization Member**  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------- |
|  Org settings                                        |  Yes                                                                                  |  Read-only                |
|  Billing                                             |  Yes                                                                                  |  No                       |
|  Org activities                                      |  Yes                                                                                  |  No                       |
|  Org members                                         |  Yes                                                                                  |  Read-only                |
|  Leaving the org                                     |  Yes (Each org must have at least one Owner, so the last Owner cannot leave the org.) |  Yes                      |
|  Creating projects                                   |  Yes                                                                                  |  No                       |
|  Project-specific data (clusters, collections, etc.) |  Yes                                                                                  |  Authorized projects only |
|  Cluster data and security                           |  Yes                                                                                  |  Authorized projects only |
|  Project collaborators                               |  Yes                                                                                  |  Authorized projects only |
|  Cluster monitoring and alerts                       |  Yes                                                                                  |  Authorized projects only |
|  Project settings                                    |  Yes                                                                                  |  Authorized projects only |

## Related topics{#related-topics}

- [Organizations & Projects](./organizations-projects) 

- [Add Organization Members](./add-organization-members) 

- [Remove Members](./remove-members) 

- [Add Project Collaborators](./add-project-collaborators-2) 

- [Manage Organization Information](./manage-organization-information) 

- [View Activities](./view-activities) 
