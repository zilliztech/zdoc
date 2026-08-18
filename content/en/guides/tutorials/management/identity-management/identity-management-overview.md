---
title: "Identity Management Overview | Cloud"
slug: /identity-management-overview
sidebar_label: "Identity Management Overview"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud uses identities to represent the people, groups, and non-human actors (such as service accounts) that can access an organization, project, cluster, API, or SDK workflow. Identity management controls who exists in Zilliz Cloud and how those identities are invited, synchronized, created, removed, or authenticated. Access control then determines what those identities can access and what actions they can perform. | Cloud"
type: origin
token: Eez3wXKnPii2DekIQ76c9jbtnWd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Identity Management Overview

Zilliz Cloud uses identities to represent the people, groups, and non-human actors (such as service accounts) that can access an organization, project, cluster, API, or SDK workflow. Identity management controls who exists in Zilliz Cloud and how those identities are invited, synchronized, created, removed, or authenticated. [Access control](./access-control-overview) then determines what those identities can access and what actions they can perform. 

# Identity and access model\{#identity-and-access-model}

The access control model in Zilliz Cloud is built around two concepts: **principals** and **roles**. A principal is an identity that can be authorized. A role is a named set of permissions. Assigning a role to a principal grants the permissions in that role within the role's scope. 

| Concept | Meaning | Examples |
| --- | --- | --- |
| Principal | An identity that can be granted access. | Organization members, project collaborators, cluster users, groups, service accounts. |
| Role | A named permission set. | Organization Owner, Billing Admin, Project Admin, Cluster Admin, Data Operator, Data Viewer, custom roles. |
| Role assignment | The act of granting a role to a principal. | Grant a project role to a user in Project A. |
| Scope | The boundary where the role applies. | Organization, project, cluster. |
| Effective access | The final access after direct assignments and group assignments are combined. | A user gets Data Viewer from a synced group and Cluster Admin from a direct project role assignment. |

# Principals\{#principals}

The following table lists the multiple types of principals in Zilliz Cloud.

| Principal type | Scope | Used for |
| --- | --- | --- |
| Organization user | Organization | Console sign-in, organization roles, and project access assignment. |
| Project collaborator | Project | Access to a specific project and its project-level resources. |
| Cluster user | Cluster | Cluster-level and data-plane access, such as database, collection, search, query, and write operations. |
| Group | Organization | Groups synchronized from an identity provider through SCIM. |
| Service account | Organization or project | Non-human access for applications, scripts, CI/CD, and automation. This is equivalent to a [customized API key.](./manage-api-keys#overview-of-api-keys) |

# How principal types relate to each other\{#how-principal-types-relate-to-each-other}

A person may appear at multiple scopes. For example, a user can be an organization user, a project collaborator in one or more projects, and a cluster user for data-plane access. These identities are managed at different levels because they protect different resource boundaries.

| Identity | What it controls | Important boundary |
| --- | --- | --- |
| Organization user | Whether a person belongs to the organization and can sign in to the console. | Organization membership does not automatically mean access to every project or cluster. |
| Project collaborator | Whether a user or group can access a specific project. | Project access must be granted for a specific project. Cross-project wildcard authorization is not supported. |
| Cluster user | Whether an identity can access cluster resources and data-plane operations. | Cluster users are managed per cluster and can have cluster roles independent of organization roles. |

# Groups\{#groups}

Zilliz Cloud supports group-based access assignment so that you can manage permissions for teams instead of assigning roles to every user individually. Groups are especially useful when your identity provider is the source of truth for team membership.

Groups are synchronized from an external identity provider through [SCIM](./scim-provisioning-overview). Zilliz Cloud does not support creating local groups or editing group membership locally. Manage group membership in your identity provider, and manage role assignments in Zilliz Cloud.

# Service accounts\{#service-accounts}

Use service accounts for non-human access. A service account represents an application, script, CI/CD job, or automation workflow. API keys authenticate requests, but they do not define permissions by themselves. Zilliz Cloud evaluates API and SDK requests based on the user or service account that owns the [customized API key](./manage-api-keys#overview-of-api-keys) and the roles assigned to that principal.