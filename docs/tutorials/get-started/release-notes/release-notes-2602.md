---
title: " February 2026 Release Notes | Cloud"
slug: /release-notes-2602
sidebar_key: release-notes-2602
sidebar_label: "Februray, 2026"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: " February 2026 Release Notes | Cloud"
type: origin
token: KtAgwMSa6iEoFkkEqzAcEJgRnjc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  February 2026 Release Notes

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-09**

    </div>

    <div>

        ## SSO enforcement\{#sso-enforcement}

        We have added the ability for Organization owners to mandate SSO for all members. Once enforced, all non-SSO authentication methods are restricted. This update allows for centralized identity management and ensures compliance with corporate security policies. 

        For details, refer to [Enforce SSO in Your Organization](./enforce-sso-in-your-organization)

        ## Cluster access control\{#cluster-access-control}

        Zilliz Cloud now supports cluster-level access control, enabling granular permission management within projects. Administrators can assign distinct roles to individual clusters and volumes, enforcing strict resource isolation without splitting projects.

        - **Per-Cluster Role Assignment:** Grants independent roles (ReadOnly / ReadWrite) to individual clusters and volumes within the same project, allowing fine-grained separation of duties across environments and workloads.

        - **Strict Access Enforcement:** API requests to unauthorized resources are rejected, and restricted resources are hidden from the Console. All access is strictly scoped to the user's granted permissions.

        - **Seamless Migration:** Existing users are automatically migrated with "All Resources" access, preserving their current project roles. No manual action is required.

        For details, refer to [Manage Organization Users](./organization-users#organization-role) and [Manage Project Users](./project-users#project-access).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-04**

    </div>

    <div>

        ## New Region: 🇮🇪 AWS Ireland\{#new-region-aws-ireland}

    </div>

</Grid>

