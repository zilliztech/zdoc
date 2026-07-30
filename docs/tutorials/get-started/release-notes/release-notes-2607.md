---
title: "July 2026 Release Notes | Cloud"
slug: /release-notes-2607
sidebar_key: release-notes-2607
sidebar_label: "July, 2026"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "July 2026 Release Notes | Cloud"
type: origin
token: CUuywySLVil4MKkmYZecUl9snLg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# July 2026 Release Notes

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-30**

    </div>

    <div>

        ## Enhancements\{#enhancements}

        - **Hugging Face embedding models** — Hugging Face is now available as a model provider via Bring Your Own Key integration. For details, refer to [Hugging Face](./hugging-face).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-15**

    </div>

    <div>

        ## BYOC supports storage integrations and external volumes\{#byoc-supports-storage-integrations-and-external-volumes}

        BYOC now supports Storage Integration and External Volume. You can now integrate an object-storage bucket through cross-account authorization and set it as an external volume.

        - **IAM-based authorization:** Authorize bucket access through IAM without embedding long-lived cloud credentials.

        For details, refer to [Integrate with AWS S3](./integrate-with-aws-s3) and [External Volumes](./external-volume).

        ## BYOC supports API Key for Cluster Access\{#byoc-supports-api-key-for-cluster-access}

        You can access the cluster by cluster endpoint with the API Key now. Customized API Key with cluster-level fine-grained access control is also supported.

        For details, refer to [API Keys](/docs/byoc/manage-api-keys).

        ## Collection-level metrics for On-Demand Clusters\{#collection-level-metrics-for-on-demand-clusters}

        On-Demand Clusters now expose collection-level performance metrics, including latency and QPS in the web console, so you can isolate workload behavior and troubleshoot individual collections more precisely.

        For details, refer to [Metrics Reference](./metrics-alerts-reference).

        ## Storage and storage-request billing for On-Demand databases and paid volumes\{#storage-and-storage-request-billing-for-on-demand-databases-and-paid-volumes}

        Vector Lakebase now meters and bills storage capacity for On-Demand databases on AWS. Storage requests are billed for both On-Demand databases and paid volumes, giving you a clearer view of the storage resources and operations that contribute to your costs.

        For details, refer to [On-Demand Compute Cost](./on-demand-compute-cost) and [Storage Request Cost](./storage-request-cost).

        ## Manage storage integrations through RESTful APIs\{#manage-storage-integrations-through-restful-apis}

        You can now manage Storage Integrations programmatically through RESTful APIs. The API supports creating, listing, describing, validating, and deleting integrations, and aligns automation workflows across RESTful API, CLI, and Terraform.

        For details, refer to [Storage Integration Operations](/reference/restful/storage-integration-operations-v2) and [Integrate with AWS S3](./integrate-with-aws-s3).

        ## Add descriptions to users and roles\{#add-descriptions-to-users-and-roles}

        You can now add and view descriptions for cluster users and roles, making it easier to identify and manage permissions. Description updates are also available through APIs and audit logs.

        For details, refer to the following docs:

        - [Manage Cluster Users (Console)](./cluster-users)

        - [Manage Cluster User (SDK)](./cluster-users-sdk)

        - [Manage Cluster Roles (Console)](./cluster-roles)

        - [Manage Cluster Roles (SDK)](./cluster-roles-sdk)

        ## Enhancements\{#enhancements}

        - **Global Cluster: The global cluster supports both RESTful APIs and Terraform for your automation workflows.

        - **Expanded Azure availability for On-Demand Search:** On-Demand Search with managed collections is now available in Azure East US. For details, refer to [Cloud Providers & Regions](./cloud-providers-and-regions) and [On-Demand Cluster](/docs/on-demand-cluster).

        - **Higher scale limits:** The maximum replica count is now 100, and the Dedicated Query CU limit is now 2,048. For details, refer to [Zilliz Cloud Limits](./limits).

        - **Customize auto-suspend for On-Demand Clusters:** You can now update an On-Demand Cluster's auto-suspend interval after the cluster is created. This gives you more control over the balance between query readiness and idle compute cost as workload patterns change. For details, refer to [On-Demand Cluster](/docs/on-demand-cluster).

        - **Improved feature guidance:** New in-product guidance makes it easier to discover and configure CMEK, Global Cluster, and Cross-Region Backup.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-06**

    </div>

    <div>

        ## BYOC-I now available on GCP\{#byoc-i-now-available-on-gcp}

        Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** now supports **Google Cloud Platform (GCP)**.

        - **Enhanced Security:** BYOC-I eliminates the need to expose your Kubernetes API to the public internet.

        - **Advanced Flexibility:** BYOC-I unlocks more extensive custom network settings via our official Terraform Provider. You can tailor to your enterprise needs now.

        For details, refer to [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp) for step-by-step manual guides, and [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) for IaC automation.

        ## Enhancements\{#enhancements}

        - **Expanded region availability for On-Demand Clusters** — On-Demand Clusters are now available in all AWS regions, aligned with Serving Dedicated supported regions.

    </div>

</Grid>

