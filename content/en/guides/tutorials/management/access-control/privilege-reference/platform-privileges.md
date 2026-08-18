---
title: "Platform Resource Privilege  | Cloud"
slug: /platform-privileges
sidebar_label: "Platform Privileges"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This reference lists the platform resource privileges used by Zilliz Cloud access control and shows how the built-in organization and project roles map to those privileges. | Cloud"
type: origin
token: GsofwhPKqi0Bfkkk7YqcRzndnah
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Platform Resource Privilege 

This reference lists the platform resource privileges used by Zilliz Cloud access control and shows how the built-in organization and project roles map to those privileges.

Use this page when you need to answer questions such as:

- Which privileges are available for each platform resource?

- Which resources support object-level role grants?

- What does each built-in organization or project role include?

- When should access be managed at the organization level, project level, or cluster level?

For cluster data-plane privileges, see [Privileges & Privilege Groups](./cluster-privileges). This page focuses on organization-level and project-level platform resources.

## How to read this reference\{#how-to-read-this-reference}

Each resource entry includes the following fields:

| Field | Description |
| --- | --- |
| **Domain** | The access-control domain where the resource belongs, such as IAM, organization, project, or data. |
| **Resource** | The resource type controlled by the privilege set. |
| **Available privileges** | The actions that can be granted for the resource. |
| **Object-level grant** | Whether the privilege can be granted on an individual object instead of the whole resource type. |
| **Built-in role access** | The access granted by each built-in organization or project role. |

The role mapping tables use the following values:

| Value | Meaning |
| --- | --- |
| `*` | The role includes all listed privileges for the resource. |
| `view` | The role can view the resource. |
| `view, modify` | The role can view and modify the resource. |
| `Read` | The role can read data for the resource. |
| `Read, Write` | The role can read and write data for the resource. |
| `-` | The role does not include privileges for the resource. |

For project roles, privileges apply only within the assigned project. A Project Admin in one project does not automatically become a Project Admin in another project.

## Predefined roles covered\{#predefined-roles-covered}

This reference covers the following built-in roles:

| Scope | Predefined roles |
| --- | --- |
| Organization | Org Owner, Billing Admin, Public |
| Project | Project Admin, Data Admin, Data Operator, Data Viewer |

## IAM resources\{#iam-resources}

IAM resources control identities, credentials, and roles used by the Zilliz Cloud platform.

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `org_member` | Identity | view, create, modify, delete | No | `*` | `-` | `view` | `-` | `-` | `-` | `-` |
| `project_member` | Identity | view, create, modify, delete | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `group` | Identity | view, create, modify, delete | No | `*` | `-` | `view` | `-` | `-` | `-` | `-` |
| `personal_api_key` | Credential | view, modify | No | `*` | `-` | `*` | `*` | `*` | `*` | `*` |
| `custom_api_key` | Credential | view, create, modify, delete | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| `service_account` | Credential | view, create, modify, delete | No | `*` | `-` | `-` | `*` | `-` | `-` | `-` |
| `org_role` | Role | view, grant | No | `*` | `-` | `view` | `-` | `-` | `-` | `-` |
| `project_role` | Role | view, grant | No | `*` across all projects | `-` | `view` across all projects | `*` in the assigned project | `view` in the assigned project | `view` in the assigned project | `view` in the assigned project |
| `project_custom_role` | Role | view, create, modify, delete, grant | No | `*` | `-` | `-` | `*` | `-` | `-` | `-` |

<Admonition type="info" icon="📘" title="Notes">

- Personal API keys are owned by individual users. Each user can reset their own personal API key. Personal API key permissions are not independently managed through the resource-privilege model.

- Project role access is project-scoped. For example, a Project Admin can manage project roles only in the project where the Project Admin role is assigned.

- Custom API keys are managed at the organization level.

</Admonition>

## Organization resources\{#organization-resources}

Organization resources control organization-wide settings and capabilities.

| Resource | Description | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Org Control Ops | Organization settings and organization-level operations | view, modify, delete | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Billing & Cost | Billing, cost, payment, usage, and organization alert access | view, manage | No | `*` | `*` | `-` | `-` | `-` | `-` | `-` |
| Authentication | Organization authentication settings | view, manage | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Recovery (Recycle Bin) | Organization recycle bin and recovery actions | view, manage | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Project | Project provisioning | create | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| All project | Organization-wide project visibility | view | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |

Organization resources are not project-scoped. Grant these privileges only to users or groups that need organization-wide administration.

## Project resources\{#project-resources}

Project resources control project lifecycle, project capabilities, resource provisioning, and project-scoped resource operations.

### Project lifecycle\{#project-lifecycle}

| Resource | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project | view, modify, delete, update_plan, update_region | Yes | `-` | `-` | `view` | `*` in the assigned project | `view` | `view` | `view` |

### Project control capabilities\{#project-control-capabilities}

| Resource | Description | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Security | Project security configuration | view, manage | No | `-` | `-` | `-` | `*` | `view` | `view` | `view` |
| Backup | Project backup configuration and backup access | view, manage | No | `-` | `-` | `-` | `*` | `view` | `view` | `view` |
| Observability | Project monitoring, metrics, and observability access | view, manage | No | `-` | `-` | `-` | `*` | `*` | `view` | `view` |

### Resource provisioning\{#resource-provisioning}

Resource provisioning privileges control who can create project resources. These privileges are not object-level grants because the target resource does not exist yet.

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `global_cluster` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `on_demand_cluster` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `volume` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `storage_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `model_provider_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `kms_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `datadog_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |

### Resource lifecycle\{#resource-lifecycle}

Resource lifecycle privileges control operations on existing project resources.

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster` | Compute & storage | view, modify, delete, scale | Yes | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `global_cluster` | Compute & storage | view, modify, delete, scale | Yes | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `on_demand_cluster` | Compute & storage | view, modify, delete, scale | Yes | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `volume` | Compute & storage | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `storage_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `model_provider_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `kms_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `datadog_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `-` | `-` |

## Data resources\{#data-resources}

Data resources control project-level access to data-bearing resources. These privileges are separate from cluster-level RBAC. Use project-level data privileges to control broad access from the Zilliz Cloud platform, and use cluster roles and privilege groups to control fine-grained database and collection operations inside a cluster.

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster_data` | Compute & storage | Read, Write, * | Yes | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |
| `on_demand_compute_data` | Compute & storage | Read, Write, * | Yes | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |
| `volume_data` | Compute & storage | Read, Write, * | Yes | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |

When configuring data privileges, `Write` implies `Read`. Selecting `*` grants both `Read` and `Write`.

## Object-level grants\{#object-level-grants}

Some resources support object-level grants. Object-level grants let administrators assign access to a specific object, such as a specific project resource, cluster, volume, or integration.

Use object-level grants when access should be narrow:

- Grant a Data Viewer role access to view one project.

- Grant a Data Operator role access to operate one volume or integration.

- Grant a data role access to read or write one data resource instead of all data resources in the project.

Resources without object-level grants are managed at the broader organization or project scope.