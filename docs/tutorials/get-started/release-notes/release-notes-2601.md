---
title: "January 2026 Release Notes | Cloud"
slug: /release-notes-2601
sidebar_key: release-notes-2601
sidebar_label: "January, 2026"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "January 2026 Release Notes | Cloud"
type: origin
token: ZBEiwpvlbijhYDkmnNScc7zyn5d
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# January 2026 Release Notes

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-29**

    </div>

    <div>

        ## Another Milvus v2.6.x new feature\{#another-milvus-v26x-new-feature}

        - **Search using primary keys**: You can now perform ANN searches using a **primary key** instead of a raw vector. This eliminates the need to manually retrieve vectors from the target collection before searching. For more details, refer to [Primary-Key Search](./primary-key-search)

        ## CMEK\{#cmek}

        Zilliz supports elevating your security posture with AWS KMS integration now. Essential for strict compliance (GDPR, HIPAA), this feature secures your sensitive assets using keys exclusively managed and governed by you.

        - **Comprehensive Data Protection:** Rigorously encrypts assets across all storage tiers and processing states, eliminating security gaps throughout the entire data lifecycle.

        - **Secure Isolation & Architecture:** Granular security boundaries isolation via Encryption Zones, backed by a 3-Tier Envelope Hierarchy (Root Key → Encryption Zone Key → Data Key). This strictly isolates databases to prevent cross-tenant access while optimizing performance.

        - **Lifecycle Governance:** Supports automated zero-downtime rotation, instant data lockdown via key revocation, and immutable configurations to prevent security drift.

        For details, refer to [Customer-Managed Encryption Keys](./cmek) and [AWS KMS](./aws-kms).

        ## BYOC now available on Azure\{#byoc-now-available-on-azure}

        Zilliz Cloud extends **Bring Your Own Cloud (BYOC)** to Microsoft Azure, combining managed service simplicity with **absolute data sovereignty**.

        - **BYOC-I Deployment for Maximum Control:** Hosts the Data Plane entirely within your Azure subscription. Ensures you maintain absolute control over your data sovereignty and security policies.

        - **Terraform Automation:** Accelerates deployment via the official Terraform Provider, fully automating complex networking and authentication for reproducible Infrastructure-as-Code (IaC).

        For details, refer to [Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-23**

    </div>

    <div>

        ## Milvus v2.6.x new feature\{#milvus-v26x-new-feature}

        - **Semantic Highlighter**: Identifies and highlights the most relevant text segments in search results based on query intent rather than exact keyword matches, improving result explainability.

        - This feature is powered by the semantic highlighting model recently open-sourced by Zilliz ([zilliz/semantic-highlight-bilingual-v1](https://huggingface.co/zilliz/semantic-highlight-bilingual-v1)) and provides out-of-the-box inference support through the Zilliz hosted model service (refer to [Hosted Models](./hosted-models)).

         For more details, refer to [Semantic Highlighter](./semantic-highlighter).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-14**

    </div>

    <div>

        ## Milvus v2.6.x new features\{#milvus-v26x-new-features}

        - **Time-zone-aware timestamp support** — Supports the `TIMESTAMPTZ` data type for storing, comparing, and filtering globally consistent timestamps—without manual time-zone handling. For details, refer to [TIMESTAMPTZ Field](./use-timestamptz-field).

        - **Highlighter** — Annotates matched terms with customizable tags and fragment-level context, making full-text search results easier to interpret and debug. For details, refer to [Lexical Highlighter](./text-highlighter).

        ## Function and Model Inference\{#function-and-model-inference}

        We are excited to announce the Public Preview of Model-Based Embedding and Reranking Functions and the Private Preview of Zilliz Hosted Models on Zilliz Cloud. This update streamlines the AI development process by allowing users to insert raw text directly into Zilliz Cloud, with the system automatically handling embedding and reranking to ensure the most relevant search results.

        You can now choose models from top-tier third-party providers like OpenAI, Cohere, and VoyageAI, or host your models directly on Zilliz Cloud.

        - **Model-Based Embedding**: Define a text embedding function during collection creation. After configuration, simply ingest raw text via Insert, Upsert, or Import, and Zilliz automatically handles embedding generation and storage. During search, the system converts text into a dense vector for efficient ANN search. For details, refer to [Model-based Functions](./model-based-functions).

        - **Model-Based Reranking**: Choose the reranking model that best fits your needs, ensuring the most relevant search results are prioritized for your specific use case. For details, refer to [Model-based Rankers](./model-ranker).

        - **Zilliz Hosted Models (Private Preview)**: Deploy fully managed model instances directly on Zilliz infrastructure to ensure stable, high-performance inference with zero data transfer fees. With models running in the Zilliz Cloud environment, your data stays within a private network, ensuring enhanced privacy and ultra-low latency. For details, refer to [Hosted Models](./hosted-models).

        Additionally, to streamline integration with third-party models, we’ve introduced **Third-Party Model Provider Integration**. This feature allows you to manage AI model credentials within Zilliz Cloud and rotate API keys at any time without modifying application code, ensuring flexible and secure integration. For details, refer to [Integrate with Model Providers](./integrate-with-model-providers).

        ## Dynamic Replica Autoscaling\{#dynamic-replica-autoscaling}

        We are introducing **Intelligent Replica Autoscaling**, a key feature designed for high-QPS environments with fluctuating demand. It automatically adjusts your cluster’s replica count based on real-time traffic patterns.

        - **Load-Adaptive Scaling**: Automatically scales replicas up during periods of high traffic and scales them down during low demand, optimizing both performance and cost.

        - **Zero-Touch Reliability**: With simple resource guardrails, the system automatically handles unpredictable traffic spikes, ensuring consistent performance without manual intervention.

        For details, refer to [Scale Replica](./manage-replica#dynamic-scaling).

        ## Advanced Scheduled Scaling with Cron\{#advanced-scheduled-scaling-with-cron}

        We have upgraded our scheduling engine to orchestrate complex, predictable business cycles. You can now automate precise scaling strategies for both CUs and Replicas using industry-standard Cron expressions.

        - **Flexible Scheduling Strategies:** Move beyond basic daily schedules. Utilize standard Cron syntax (e.g., `0 9 * * * 1-5`) to define intricate rules, such as "scale up exclusively for month-end."

        - **Multi-Schedule Logic:** Configure independent, layered schedules for the same cluster, enabling you to adjust resource profiles for peak weekdays and off-peak weekends, optimizing efficiency in line with your business realities.

        For details, refer to [Scale Query CU](./scale-query-cu#scheduled-scaling) and [Scale Replica](./manage-replica#scheduled-scaling).

        ## Global Cluster\{#global-cluster}

        We are excited to announce the Global Cluster for the Zilliz Cloud Business Critical Plan.

        The Global Cluster creates a unified database architecture across multiple geographic regions by linking a primary cluster with cross-region secondary clusters for automated replication. This solution provides robust Disaster Recovery (DR), ensuring your mission-critical applications remain resilient and your data durable, even in the event of a regional outage.

        - **Automated Global Deployment:** The system handles the seamless orchestration of Primary-Secondary topologies with one click, allowing you to provision a Global Cluster in a single step with automated data replication channels.

        - **Seamless DR Expansion:** Support for the dynamic addition of secondary clusters to active production instances. You can now upgrade a running dedicated cluster to a multi-region global architecture smoothly without service interruption or downtime.

        - **Enhanced Observability:** A new Global Topology dashboard provides a unified view of your cluster hierarchy. You can now monitor real-time replication latency and synchronization status across regions from one interface.

        **Coming Soon:**
        We are expanding our resilience toolkit. The next phase will introduce Failover for automatic switching during region-level outages, and a Global Endpoint that reroutes SDK traffic, significantly reducing Recovery Time Objectives (RTO).

        For details, refer to [Global Cluster Explained](./global-cluster-explained), [Create Global Cluster](./create-global-cluster), and [Manage Global Cluster](./manage-global-cluster).

        ## BYOC - Full Autoscaling Suite aligns with SaaS\{#byoc-full-autoscaling-suite-aligns-with-saas}

        **Bring Your Own Cloud (BYOC)** deployments now support the complete Zilliz Cloud autoscaling ecosystem. This update aligns BYOC with our SaaS offering, granting access to all previously released optimizations (like automatic scale-down) as well as the **latest capabilities**.

        - **Dynamic Scaling:** Available for both CUs and Replicas, the system intelligently adjusts resources based on real-time load to optimize performance and cost, with simple Min/Max configuration.

        - **Scheduled Scaling:** Full support for the new Advanced Mode. Users can now leverage standard Cron expressions and multi-schedule logic to automate precise resource adjustments for complex, predictable business cycles.

        For details, refer to [Scale Query CU](/docs/byoc/scale-cluster) and [Scale Replica](/docs/byoc/manage-replica).

        ## BYOC - Support & Troubleshooting Access Control\{#byoc-support-and-troubleshooting-access-control}

        Gain authority over operational access to your data plane. Ensuring that Zilliz engineers have access to your infrastructure only when explicitly permitted.

        - **Just-in-Time (JIT) Privileges:** Grant temporary access during troubleshooting windows and revoke it immediately once resolved.

        - **Operational Isolation:** Revoking access creates a strict barrier without disrupting essential observability pipelines (Metrics, Logs, and Alerts).

        - **Governance & Compliance:** All access grants and revocations are immutably logged in your Audit Logs for complete accountability and security reviews.

        For details, refer to [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws#technical-support-access), [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws#technical-support-access), and [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp#technical-support-access).

        ## Enhancements\{#enhancements}

        - **Collection TTL and AutoID Settings**: You can now monitor and modify the collection TTL and Allow insert AutoID settings directly from the Collection Overview GUI. For details, refer to [Set Collection TTL](./set-collection-ttl) and [Modify Collection](./modify-collections).

        - **Data Import**: Support for JSON lines format (.JSONL and .NDJSON extensions) is now available. For details, refer to [Import from a JSON/JSON Lines File](./data-import-json).

        - **Milvus Endpoint Migration**: Now supports **Geometry** and **Struct** data types, enabling seamless migration of collections with spatial shapes and deeply nested attributes.

        - **Job Details View**: The side drawer UI has been refreshed for improved navigation and better user experience.

        - **BYOC - Custom S3 Bucket Support**: You can now deploy BYOC clusters with custom, dedicated S3 buckets, providing granular data isolation and independent lifecycle management.

        - **BYOC - AWS KMS Integration**: AWS KMS (CMEK) integration for S3 bucket encryption has been added, satisfying strict security compliance standards.

        - **Enhanced Metrics Dashboards**: Visual threshold guidelines have been added to help users identify optimal utilization levels for scaling CUs and Replicas.

        - **RESTful API & Terraform Enhancements:** Now supports [Auto Scaling](/reference/restful/modify-cluster-v2), [Cross-Region Backup](/reference/restful/create-backup-v2), [Tiered Storage for Create Cluster](/reference/restful/create-dedicated-cluster-v2), and [Business Critical Plan for Create Project](/reference/restful/create-project-v2), improving disaster recovery and storage management, enabling more efficient automation programming.

    </div>

</Grid>

