---
title: "Release Notes (July 15, 2025) | Cloud"
slug: /release-notes-2180
sidebar_label: "Release Notes (July 15, 2025)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In this release, Zilliz Cloud introduces several powerful enhancements aimed at improving operational efficiency, flexibility, and user experience. These include support for cluster-level scheduled auto-scaling, schema evolution via the new Merge Data API, the introduction of stage — a cloud-native data layer for streamlined data ingestion, partial restore from cluster-level backups with cross-database selection, and UI support for JSON Path indexes. Together, these features enable users to manage complex workloads more effectively, reduce maintenance overhead, and speed up development cycles in the GenAI era. | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

---

import Admonition from '@theme/Admonition';


# Release Notes (July 15, 2025)

In this release, Zilliz Cloud introduces several powerful enhancements aimed at improving operational efficiency, flexibility, and user experience. These include support for cluster-level scheduled auto-scaling, schema evolution via the new Merge Data API, the introduction of stage — a cloud-native data layer for streamlined data ingestion, partial restore from cluster-level backups with cross-database selection, and UI support for JSON Path indexes. Together, these features enable users to manage complex workloads more effectively, reduce maintenance overhead, and speed up development cycles in the GenAI era.

## Milvus Compatibility\{#milvus-compatibility}

All Zilliz Cloud clusters created after this release are compatible with **Milvus v2.5.x**, and all features from Milvus v2.5.x are **Generally Available**. 

For details on feature availabilities, refer to [Current Feature Availability](./feature-availability#current-feature-availability).

## Schema Evolution via Merge Data API | PRIVATE\{#schema-evolution-via-merge-data-api}

In the GenAI era, rapid iteration on business logic drives more frequent schema changes than ever, yet they remain costly and operationally complex. Updating a schema often means rebuilding the Collection: exporting data, merging new fields, and reimporting everything from scratch. This manual process is time-consuming, error-prone, and often requires prolonged write downtime.

To address this challenge, Zilliz introduces a new **batch ETL capability** for automated schema evolution. As part of this release, a new **Merge Data RESTful API** is added under the ETL service, enabling users to perform large-scale schema updates with a single API call. The API allows merging an existing Collection (Base) with an external file (containing primary keys and new fields) to generate a new Collection (Target) with the updated schema. Once verified, users can simply update the alias to switch over with minimal disruption.

Under the hood, the Merge Data API orchestrates a distributed batch processing engine along with Stage, Backup, Join, and Import into a single operation. Users no longer need to coordinate each step manually. The entire process, from data validation to import, is handled automatically. This dramatically reduces operational burden and allows schema updates to complete in **hours instead of days**.

<Admonition type="info" icon="📘" title="Notes">

<p>During the merge process, writes to the base Collection must be suspended to ensure data consistency.</p>

</Admonition>

This feature is currently in **Private Preview**. Please [contact support](https://support.zilliz.com/hc/en-us) to enable it for your account. For the related RESTful API reference page, refer to [Merge Data](/reference/restful/merge-data-v2).

## Introducing Stage: The Data Layer of Zilliz Cloud | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

We're excited to introduce **Stage**, a brand-new capability and the foundational **Data Layer of Zilliz Cloud**.

Stage provides a managed, cloud-native staging area for unstructured data. It is purpose-built to support scalable data movement, including uploading, caching, and preparing data for migration and import into vector clusters, serving as a unified layer for ETL workflows across Zilliz services.

In this initial release (**Private Preview**), users can:

- **Manage stages** via RESTful APIs, including [Create](/reference/restful/create-volume-v2), [list](/reference/restful/list-volumes-v2), and [delete](/reference/restful/delete-volume-v2) stages

- **Use Stage as a shared staging layer** for both **Migration** and **Import** services to streamline data onboarding:

    - **Migration**: Seamlessly migrate data from local Milvus environments to Zilliz Cloud in a single step. Previously, users had to manually create backups, upload files to S3, and trigger import jobs separately. With Stage, the process is unified, faster, and far less error-prone. For details, refer to [Migrate from Milvus to Zilliz Cloud Via Stage](./via-stage).

    - **Import**: Import jobs now accept Stage as a staging backend, reducing dependency on object storage, avoiding token expiration, and helping users without direct cloud storage access move data into Zilliz Cloud with ease. For details, refer to [Create Import Jobs](/reference/restful/create-import-jobs-v2) and select **Use Stage** in **Request Body**.

Stage will soon be integrated with additional services like Backup, Import, and the ETL service, extending support to unstructured data processing, data sharing, and pipeline-driven workloads within Zilliz Cloud.

This feature is currently in **Private Preview**. Please [contact support](https://support.zilliz.com/hc/en-us) to enable it for your account.

## Scheduled Cluster Scaling Now Available\{#scheduled-cluster-scaling-now-available}

Zilliz Cloud now supports **scheduled scaling** at the **cluster level**, giving you proactive control over resource allocation based on predictable workload patterns.

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **Schedule-Based Autoscaling for CUs and Replicas:** You can now define specific schedules to automatically scale your CU and Replicas. Effortlessly scale up resources to handle peak traffic during business hours and scale down during quiet periods like nights and weekends to optimize costs without manual intervention.

- **Enhanced Visibility and Control:** This update brings greater transparency to your autoscaling configurations by introduce a visual representation of your scaling schedules.

- **Proactive Auditing:** We provide a transparent email noticing system and audit trail, which gives you peace of mind for resource delivery and cost.

For details, refer to [Cluster Auto-scaling](./scale-cluster).

## Partial Restore from Cluster-level Backups with Cross-Database Selection\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

You can now selectively restore specific **databases** and **collections** from a **cluster-level backup**, including collections across multiple databases.This enhancement reduces recovery time and gives you fine-grained control over what data to restore, without needing to recover the entire cluster.

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

For details, refer to [Restore a Partial Cluster](./restore-from-snapshot#restore-a-partial-cluster).

## Create JSON Path Indexes on Zilliz Cloud Console\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloud now supports creating JSON Path indexes directly from the web console, making it easier to accelerate queries on semi-structured data. This feature supports both JSON fields and dynamic field for flexible, high-performance filtering.

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

For details on JSON path indexes, refer to [Index Values Inside a JSON Field](./use-json-fields) and [Index Keys in the Dynamic Field](./enable-dynamic-field#index-keys-in-the-dynamic-field).

## BYOC Project Instance Quota Settings Now Available\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloud now supports custom instance quota settings** for your BYOC projects. This update provides greater flexibility, allowing you to optimize costs by defining clear resource boundaries for your services.

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **Project Resource Autoscaling Control:** You can now easily switch between elastic and fixed resource modes. Enable elasticity by setting minimum and maximum instance counts, or lock your service groups resource to a fixed size.

- **Dynamic Configuration:** You can now view and adjust your node group resource and quotas directly from the Project Status page in the console, making it simple to modify resource allocations for a running project.

- **Independent Index Service Quotas:** Zilliz Cloud now allows you to set resource quotas for index node groups independently, enabling you to fine-tune performance and resource allocation for different workload patterns.

For details, refer to [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws), [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws), and [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp).

## Other Enhancements\{#other-enhancements}

- You can select whether to restore RBAC configurations when performing cluster-level backup restores.

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" icon="📘" title="Notes">

    <p>This setting only applies to newly created backups.</p>

    </Admonition>

- You can learn about the features in **Private Preview** and **Public Preview** before you use them. To use these features, contact [Zilliz Cloud support](https://support.zilliz.com/hc/en-us).

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- The total file size per import request has been increased from 100 GB to 1 TB.

- The retention period for manually created backups will be changed to 30 days once your organization becomes frozen, instead of remaining permanent, which will help you save storage costs.

