---
title: "December 2025 Release Notes | Cloud"
slug: /release-notes-2512
sidebar_label: "December 2025 Release Notes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Volume GA Email | Cloud"
type: origin
token: LX0RwtoEEihhNukmt1DcSQGfnjb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# December 2025 Release Notes

Volume GA Email

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## Milvus v2.6 GA\{#milvus-v26-ga}

        This release marks the GA milestone for the Milvus v2.6.x, bringing production-ready stability and full feature support on Zilliz Cloud, including Geometry, Struct, and TimestampTz data types, field addition without downtime, enhanced full-text search, accelerated JSON filtering, new reranking functions, INT8 vector support, partial upserts, and the MINHASH_LSH index.

        Tiered Storage also reaches GA, introducing the upgraded hot/warm/cold architecture and beginning cold data-access billing. See [Storage Cost](./storage-cost#cold-data-access) for full details.

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

