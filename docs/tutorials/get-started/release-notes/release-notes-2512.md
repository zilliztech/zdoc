---
title: "December 2025 Release Notes | Cloud"
slug: /release-notes-2512
sidebar_label: "December 2025 Release Notes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "December 2025 Release Notes | Cloud"
type: origin
token: LX0RwtoEEihhNukmt1DcSQGfnjb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# December 2025 Release Notes

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-10**

    </div>

    <div>

        ## Enhancements\{#enhancements}

        - Milvus Endpoint migration now supports Geometry and Struct data types, enabling seamless migration of collections with spatial shapes and deeply nested attributes.

        - The billing console now displays your Advance balance, offering clearer visibility into prepaid usage and remaining balance.

        - RESTful APIs now support Auto Scaling configuration, allowing programmatic management of cluster elasticity policies.

        - Job Center provides more detailed progress updates, giving users clearer insights into job status and execution stages.

        - The registration flow has been optimized with a simplified form, improving onboarding efficiency and overall user experience.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## Volume GA (formerly Stage)\{#volume-ga-formerly-stage}

        We’re excited to announce that **Stage has reached GA** and has been officially renamed to **Volume**. A Volume is a managed object store that holds either structured tables or collections of unstructured data files, serving as the unified data layer for scalable data onboarding and ETL workflows in Zilliz Cloud.

        New capabilities in this GA release：

        - **Volume-level RBAC** 

            Fine-grained, role-based access control for read/write permissions.

        - **Console support**

            Create, manage, and monitor Volumes directly in the Zilliz Cloud console.

        - **GCP support** 

            Volumes now support **AWS and GCP**, enabling multi-cloud flexibility.

        With GA, Volume now supports two billing modes: Free Trial Volume and Pay-as-you-go Volume. Pay-as-you-go Volumes will begin billing based on storage usage.

        For details, refer to [Volume Explained](./volume-explained), [Manage Volumes (SDK)](./manage-stages), and [Manage Volumes (Console)](./manage-volumes-via-console).

        ## Organization-Level IP Access Allowlist\{#organization-level-ip-access-allowlist}

        To strengthen security and meet enterprise compliance needs, Zilliz Cloud now supports Organization-Level IP Access Allowlists for Enterprise and Business Critical plans.

        - **Granular Access Control** 

            The Organization owner can define trusted IPv4 addresses or CIDR ranges for console access; traffic from unapproved sources is blocked.

        - **Comprehensive Auditing 

            All allowlist lifecycle events (enable, disable, rule changes) are recorded in Platform Audit Logs.

        For details, refer to [Set Up Console IP Allowlist](./setup-console-ip-allowlist).

        ## MFA Security Upgrade:\{#mfa-security-upgrade}

        Zilliz Cloud now supports **TOTP-based MFA** (e.g., Google/Microsoft Authenticator), providing stronger protection than email-based verification.

        - **Organization-Level Enforcement**: Enterprise Plan administrators can now enforce mandatory MFA policies for all organization members to ensure compliance standards.

        - **Legacy Migration**: Email-only MFA will be deprecated. Existing users will be prompted to migrate to an authenticator app.

        For details, refer to [MFA](./multi-factor-auth).

    </div>

</Grid>

