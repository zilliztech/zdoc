---
slug: /organizations-projects
sidebar_position: 1
---



# Organizations & Projects

Zilliz Cloud uses organizations and projects for access control and logical separation of resources. This feature aids in managing clusters across projects with fine-grained access control.

## Organizations{#organizations}

An organization is the highest level of abstraction within Zilliz Cloud services. It contains projects and members. In most cases, an organization represents a real-world company or other types of isolated grouping units.

Organizations allow for the creation of a hierarchy of projects, which helps to group and organize cluster resources efficiently. An organization can be created by the owner or administrator of the account. The owner or administrator can then invite other users to join the organization and assign them roles with different levels of permissions.

This feature is helpful for organizations with multiple database projects on Zilliz Cloud and several team members requiring varying access permissions.

## Projects{#projects}

Projects, on the other hand, are logical containers within an organization that group clusters and other related resources. Projects help in easy management of resources, and each project can have its access control policies.

Within an organization, each project provides a silo of data, which can represent a development team or unit within a company. Users in a project can create one or more Zilliz Cloud clusters, and all queries or searches are specific to that project.

With organizations and projects, users can have fine-grained control over the resources that they can access. For example, an account owner can create an organization and invite users to join it. Then, users who are granted the **Organization Owner** role can create different projects and invite other members to join them with appropriate roles and permissions. This ensures that users only have access to the resources that they require and nothing more.

## Related topics{#related-topics}

- [Roles & Privileges](./roles-privileges) 

- [Add Organization Members](./add-organization-members) 

- [Remove Members](./remove-members) 

- [Add Project Collaborators](./add-project-collaborators-2) 

- [Manage Organization Information](./manage-organization-information) 

- [View Activities](./view-activities) 
