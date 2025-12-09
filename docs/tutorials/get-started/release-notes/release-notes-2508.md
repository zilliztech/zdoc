---
title: "August 2025 Release Notes | Cloud"
slug: /release-notes-2508
sidebar_label: "August 2025 Release Notes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "August 2025 Release Notes | Cloud"
type: origin
token: JNWZwEqkwiDmeSkVPBlc4hnanEe
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# August 2025 Release Notes

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025-08-20**

    </div>

    <div>

        ## Autoscaling Upgrade\{#autoscaling-upgrade}

        **We will introduce a significant upgrade to the autoscaling feature in Zilliz Cloud,** evolving to provide a better and automated resource management experience. Here are the key improvements:

        - **Intelligent Autoscaling:** You will no longer need to manually set a capacity threshold for scaling up. Our system will automatically ensure optimal performance and resource utilization based on real-time workload demands.

        - **Support for Automatic Scaling Down:** A much-requested feature is here! The new autoscaling will support automatic scaling down during periods of lower load, optimize costs without manual intervention.

        - **Simplified Configuration:** You only need to set the minimum and maximum CU size now. Zilliz Cloud will then automatically manage the scaling within these boundaries to balance availability and resource utilization.

        ## Audit Log GA\{#audit-log-ga}

        With this release, we are excited to announce the **GA(general availability)** of **Audit Logs** and now clusters hosted in **all three cloud providers** are supported- AWS, GCP, and Azure.

        VectorDB Audit Logs provides detailed records of user activities within your cluster, helping you **improve security, ensure compliance, and troubleshoot issues** more efficiently. With complete visibility into operations, from query/search to data management operations, from connection events to user or role changes, Audit Log enables you to **monitor data access**, detect unusual behavior, and **meet enterprise governance and compliance requirements**.

        Starting from GA, Audit Log will be a **paid feature**. To enable it, please select a **dedicated cluster** under the **Enterprise Plan**.

        - For usage details, see [VectorDB Audit Logs User Guide](./audit-logs).

        - For pricing information, see [Pricing Guide](./understand-cost).

        ## Improved SSO Experience\{#improved-sso-experience}

        With this release, we’ve improved the SSO setup process in Zilliz Cloud to make configuration simpler, faster, and less error-prone.

        **Highlights:**

        - **IdP-specific flow**: Tailored guidance for **Okta**(OIDC, SAML 2.0), **Microsoft Entra**(SAML 2.0), and **Google Workspace**(SAML 2.0), both on Console and in [Documentation](./single-sign-on).

        - **Better UX**: Clearer field mappings and certificate upload validation help prevent misconfigurations.

        - **Enhanced documentation:** with **visual, IdP-specific examples**, reducing the need to switch constantly between Zilliz UI and IdP admin console.

        ## Enhancements\{#enhancements}

        - You can now manage the entire **lifecycle of a stage through SDKs(Python, Java)**. After creating a stage via SDK, you can seamlessly upload files and handle workflows, making development smoother and more efficient.

        - You can now **import local files in Parquet format** directly through **the GUI**, further extending the supported formats beyond JSON, making it easier to work with large datasets and streamline your data onboarding process.

        - **Migration from Milvus backup file** now supports selecting specific **databases and collections**, giving you more flexibility and precision when transferring data from on-premise Milvus onto cloud.

        - You can now **view all aliases** associated with a collection on Zilliz GUI, making it easier to manage and track alias usage.

        - Zilliz's Terraform Provider supports BYOC instance management now. You can create, update and delete instances within your BYOC project with Terraform.

        - Usage now supports exporting usage details to CSV, along with an improved user experience that makes it easier to analyze and archive data.

        - The email address in the Billing Profile can now receive billing notifications, ensuring your finance team stays up to date.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025-08-13**

    </div>

    <div>

        ## Support AWS Sydney Region\{#support-aws-sydney-region}

    </div>

</Grid>

