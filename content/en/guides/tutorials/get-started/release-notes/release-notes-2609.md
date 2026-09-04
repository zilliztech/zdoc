---
title: "September 2026 Release Notes | Cloud"
slug: /release-notes-2609
sidebar_label: "Sept, 2026"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: RiylwqPvoi1mrNk79qOc7M2cnph
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# September 2026 Release Notes

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-09-03**

    </div>

    <div>

        ## Enhanced access control with custom roles and SCIM provisioning\{#enhanced-access-control-with-custom-roles-and-scim-provisioning}

        Zilliz Cloud now separates organization roles from project roles, lets you define custom project roles, and provisions users and groups from your identity provider through SCIM, so you can grant least-privilege access at each level and keep it in step with your organization.

        - **Separate organization and project roles:** Organization roles (Organization Owner, Billing Admin, Public) govern organization settings and billing. Project roles (Project Admin, Data Admin, Data Operator, Data Viewer) govern clusters and data within a project. A user or group can hold several roles, and the effective permissions are the union. For details, refer to [Access Control Explained](./access-control-overview).

        - **Custom project roles:** Build a role from a predefined template, combine platform, compute, and data-access permissions, and scope compute and data access to all clusters or to specific clusters in the project. For details, refer to [Manage Platform Roles](./manage-platform-roles) and [Platform Resource Privilege Reference](./platform-privileges).

        - **Group-based role assignment:** Assign organization and project roles to groups synced from your identity provider, so access follows team membership. For details, refer to [View SCIM-Synced Groups](./view-scim-synced-groups).

        - **SCIM provisioning with Okta and Microsoft Entra:** Provision users, groups, and group memberships from your identity provider. SCIM syncs identities only; you assign roles in Zilliz Cloud. For details, refer to [SCIM Provisioning Overview](./scim-provisioning-overview), [Configure SCIM Provisioning with Okta](./configure-scim-provisioning-with-okta), and [Configure SCIM Provisioning with Microsoft Entra](./configure-scim-provisioning-with-microsoft-entra).

        - **Role management through the RESTful API:** List roles, create custom project roles, and grant or revoke roles for members and groups programmatically, so automation workflows can use the same model as the console. For details, refer to the [Role Management API Reference](/reference/restful/list-cloud-roles-v2).

        - **Redesigned Access Control pages:** Members, Groups, and Project Roles tabs, plus an Invite Member flow that sets the organization role and optional project access in one step. For details, refer to [Manage Platform Users](./manage-platform-users).

        <Admonition type="info" icon="📘" title="Notes">

        - **Organization Owners no longer inherit project access.** Organization roles now cover organization settings, members, billing, and authentication only. An Organization Owner needs a project role to manage or access a project's resources. An Organization Owner who creates a project receives the Project Admin role on it automatically.
        
        - **Existing Organization Owners keep their access.** They have been granted the Project Admin role on every project they could access before this release. For projects created by other members after this release, assign a project role explicitly via the web console **or through API**.
        
        - **Existing role assignments are mapped automatically.** Admin becomes Data Admin, Read-Write becomes Data Operator, and Read-Only becomes Data Viewer. Assignments restricted to specific clusters become custom roles with the same restrictions. Effective permissions do not change.
        
        - **Action is required only if you automate role management.** If you manage roles through Terraform or the API, update your workflows to assign project roles to Organization Owners explicitly and to use the new role names.

        </Admonition>

        ## Slow logs for Dedicated clusters\{#slow-logs-for-dedicated-clusters}

        Dedicated clusters in Enterprise projects can now record slow Search, Hybrid Search, and Query requests and deliver them to your own object storage through a Storage Integration, at no additional cost.

        - **Configurable threshold:** Log any request whose execution time exceeds the threshold you set (default 150 ms). Changes apply immediately to new entries.

        - **Delivered to your bucket:** Choose a Storage Integration and a directory. Logs are written as JSON Lines files under `/<cluster-id>/slow/<date>/`.

        - <strong>Analysis-ready fields:</strong>  Include timestamp, execution duration, Database, Collection, SDK and version, client IP, Trace ID, and status for downstream observability and analysis.

        For details, refer to [Configure Slow Logs](./configure-slow-logs) and [Slow Logs Reference](./slow-log-reference).

        ## Replicas and autoscaling at cluster creation\{#replicas-and-autoscaling-at-cluster-creation}

        You can now set the replica count and the Query CU autoscaling range when you create a Dedicated cluster or a Global Cluster, instead of adjusting them after the cluster is running.

        - **Dedicated clusters:** In Enterprise projects, Query CU autoscaling is enabled by default with a configurable minimum and maximum. You can also choose the number of replicas; multiple replicas require 8 CU or more.

        - **Global Clusters:** Configure autoscaling on the primary cluster and set a different replica count for the primary and each secondary cluster, in the console or through the Create Global Cluster API.

        For details, refer to [Create Cluster](./create-cluster) and [Create Global Cluster](./create-global-cluster).

        ## Region-aware project navigation\{#region-aware-project-navigation}

        The web console now organizes project resources by region, which makes multi-region projects easier to work with.

        - **Project-level region selector:** The Clusters, Volumes, Backups, On-Demand, and API Playground pages show one region at a time, and the selection is remembered per project.

        - **Project Settings page:** View project information and all bound regions, and add regions from one place. The redesigned Create Project and Add Region dialogs show the cloud provider and the supported cluster types for each region.

        - **Faster cluster creation:** Create Cluster pre-selects the current region. Business Critical projects can add a new region automatically during creation.

        - **Remove a region from a multi-region project** — Business Critical projects can now remove a bound region from the console or API once it holds no clusters, volumes, backups, or integrations. At least one region must remain. Not available for BYOC projects.

        For details, refer to [Manage Projects](./manage-projects).

        ## Enhancements\{#enhancements}

        - **Resize On-Demand Clusters in place** — You can now change the number of query CUs, along with the name, description, and auto-suspend interval, on an existing On-Demand Cluster from the console or the Update On-Demand Cluster API. For details, refer to [Manage On-Demand Cluster](./manage-on-demand-clusters).

        - **Delete the default project** — The default project can now be deleted like any other project once it holds no clusters or volumes, e.t.c. For details, refer to [Manage Projects](./manage-projects).

        - **Manage collection aliases in the console** — The collection list and Overview pages now show aliases, and you can create, alter, and delete aliases from the Actions menu without SDK calls. For details, refer to [Manage Collections (Console)](./manage-collections-console).

        - **Clearer source and target selection for migration** — The cross-cluster migration wizard now filters clusters by the project selected on each side, so only valid source and target clusters are shown. For details, refer to [Offline Migration](./offline-migration).

        - **Project alerts for log forwarding failures** — You can now create project alerts for Audit Log, Access Log, and Slow Log forwarding failures. Zilliz Cloud notifies configured recipients when forwarding fails, helping you identify issues quickly. Audit Log billing is automatically paused and resumes when forwarding recovers. For details, refer to [Manage Project Alerts](./manage-project-alerts)

        - **On-Demand Compute for BYOC** — BYOC projects can now enable On-Demand Compute per Data Plane from the new On-Demand entry under Serving Clusters, and use On-Demand Clusters, external collections, and project databases inside your own cloud account. For details, refer to [Quick Start to On-Demand Search](/docs/byoc/quick-start-to-on-demand-search), [On-Demand Database](/docs/byoc/on-demand-database), and [Manage External Collections (Console)](/docs/byoc/manage-external-collections-console).

    </div>

</Grid>
