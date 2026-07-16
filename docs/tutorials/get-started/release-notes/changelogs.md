---
title: "Changelogs | Cloud"
slug: /changelogs
sidebar_label: "Changelogs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Last updated July 6, 2026 | Cloud"
type: origin
token: MUL3wkn7Yi3YoFkYk59csf8bnNc
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# Changelogs

**Last updated:** July 6, 2026

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Next releases**

    </div>

    <div>

        - More vector lakebase features are on the way.

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 15, 2026](./release-notes-2607#byoc-supports-storage-integrations-and-external-volumes)**

    </div>

    <div>

        - 💾 [Storage integration](/docs/byoc/integrate-with-aws-s3) and [external volumes](/docs/byoc/external-volume) become available for BYOC projects.

        - 📈 [Collection-level metrics](./metrics-alerts-reference) go online for on-demand clusters.

        - 💳 On-demand compute and external volumes now incur charges. For the breakdown, see [On-Demand Compute Cost](./on-demand-compute-cost) and [Storage Request Cost](./storage-request-cost).

        - 💻 [Programmable storage integrations](/reference/restful/storage-integration-operations-v2) are available through RESTful APIs.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 6, 2026](./release-notes-2607)**

    </div>

    <div>

        - 🔒 Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** now supports **Google Cloud Platform (GCP)**. For details, refer to [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp) for step-by-step manual guides, and [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) for IaC automation.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 24, 2026](./release-notes-2606)**

    </div>

    <div>

        - 💾 You can now orchestrate highly customized backup cycles. For details, see [Schedule Automatic Backups](./schedule-automatic-backups).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 17, 2026](./release-notes-2606)**

    </div>

    <div>

        - 💾 You can now specify the compatible Milvus version when you restore a cluster. For details, see [Restore from Backup Files](./restore-from-backup-files) and [Use Recycle Bin](./use-recycle-bin).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 3, 2026](./release-notes-2606#nullable-vector)**

    </div>

    <div>

        - 📅 Vector fields now support the `nullable` attribute, making it possible to add a new vector field to an existing collection.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[May 13, 2026](./release-notes-2605#byoc-multi-dataplane-support)**

    </div>

    <div>

        - 🔒 Multiple data planes in different regions are allowed in your BYOC projects.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[May 7, 2026](./release-notes-2605)**

    </div>

    <div>

        - 🏠 Zilliz Cloud evolves from a vector database product into a Vector Lakebase platform with the following highlighted features:

            - [On-demand search](./quick-start-to-on-demand-search)

            - [External data lake search](./quick-start-to-external-data-lake-search)

        - 🐦 Milvus v3.0.x enters Private Review for on-demand compute in Zilliz Cloud with the following features:

            - [External collections and backfill](./create-external-collection)

            - [Nullable vectors](./nullable-fields),

            - [Embedding list searches and filtering](./use-array-of-structs),

            - [MinHash function](./minhash-function)

            - Order by for [searches](./single-vector-search#sort-search-results-by-scalar-fields) and [queries](./get-and-scalar-query#sort-query-results),

            - [Snapshots](./snapshots),

            - [Entity TTL](./set-collection-ttl),

            - Force merge,

            - Custom dictionaries and tokenizers, and

            - Spark semantic deduplication and abnormal detection

        - 💾 The read-only [external volumes](./external-volume) for import, migration, and external-collection workflows become online.

        - 🔍︎ Collection-level [large top-K](./use-large-topk) becomes available, expanding the maximum number of returned entities from 16,384 to 1,000,000 for enabled collections

        - 🗺️ [Regional constraints are available in projects](./manage-projects#add-project-regions), helping enterprises manage data residency and keep regional data-plane access explicit.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April](./release-notes-2604)[ 11, 2026](./release-notes-2604)**

    </div>

    <div>

        - [🌎 Global cluster](./global-cluster-explained) now fully supports regional disaster recovery failure with refined platform capabilities.

        - 📈 More fine-grained [metrics are available at the collection level](./metrics-alerts-reference#cluster-and-collection-metrics).

        - 📋 [Access logs](./access-log-overview) are available in Public Preview.

        - ⚙️ The [maintenance window](./organization-settings#set-up-preferred-maintenance-window) has been redesigned to provide more predictable upgrade scheduling and proactive notifications.

        - 👥 A new [cluster admin](./project-users#cluster-admin) role grants team members operational access to specific clusters without full project-level admin privileges.

        - 💾 Tiered storage becomes available to clusters in BYOC projects.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[February 9](./release-notes-2602#sso-enforcement)[, 2026](./release-notes-2602#sso-enforcement)**

    </div>

    <div>

        - 🔐 [SSO enforcement](./enforce-sso-in-your-organization) to restrict access from non-SSO authentication.

        - 👥 Cluster-level access control configured at the [organization-](./organization-users#organization-role) and [project-level](./project-users#project-access) for fine-grained data access.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[February 4](./release-notes-2602#new-region-aws-ireland)[, 2026](./release-notes-2602#new-region-aws-ireland)**

    </div>

    <div>

        - **New Region**: 🇮🇪 AWS Ireland (eu-west-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 29, 2026](./release-notes-2601#another-milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   Another new Milvus v2.6.x features become available on Zilliz Cloud

            - [Primary-Key Search](./primary-key-search)

        - 🔒 BYOC-I becomes available on [Microsoft Azure](/docs/byoc/deploy-byoc-i-azure).

        - 🔐 [Customer-managed encryption keys](./cmek) are available for the encryption of data at rest in your Zilliz Cloud clusters.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 23, 2026](./release-notes-2601#milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   A new Milvus v2.6.x features become available on Zilliz Cloud

            - [Semantic Highlighter](./semantic-highlighter)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 15, 2026](./release-notes-2601)**

    </div>

    <div>

        - 🚀   New Milvus v2.6.x features become available on Zilliz Cloud

            - [TIMESTAMPTZ Field](./use-timestamptz-field)

            - [Text Highlighter](./text-highlighter)

        - 🤖 Model-based embedding functions such as [OpenAI](./openai), [Voyage AI](./voyage-ai), and [Cohere](./cohere), and reranking functions, such as [Cohere reranker](./cohere-model-ranker) and [Voyage AI reranker](./voyage-ai-model-ranker), for public preview.

        - 🤖 [Hosted models](./hosted-models) for private preview.

        - 🛠️ [Dynamic replica autoscaling](./auto-scaling) with intelligence.

        - 📅 Advanced [scheduled scaling](./scheduled-scaling) with familiar cron settings.

        - 🌎 [Global cluster](./global-cluster-explained) becomes alive. [Contact us](https://support.zilliz.com/hc/en-us) to access.

        - ☁️ BYOC becomes more user-friendly with the following enhancements:

            - [Full autoscaling capabilities](/docs/byoc/scale-cluster)

            - [Technical support access control](/docs/byoc/deploy-byoc-aws#technical-support-access)

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 26, 2025](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x becomes generally available (GA)

        - 💾  Tiered storage becomes GA, and [billing starts](./storage-cost)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[December 1, 2025](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  Stage has been renamed to [Volume](./managed-volume), and becomes GA

        - [🔐  Organization-level IP Whitelist](./setup-console-ip-allowlist) becomes available

        - [🔐  TOTP-based MFA](./multi-factor-auth) becomes available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[November 6, 2025](./release-notes-2511#business-critical-plan-availability)**

    </div>

    <div>

        - 🚀  Milvus v2.6.x becomes available on the Zilliz Cloud with more data types:

            - [Geometry](./use-geometry-field), and

            - [Array of Structs](./use-array-of-structs)

        - 🔍  Full-text search capabilities are now available during [migrations](./via-endpoint#getting-started).

        - ⏰  Customizing the [notification interval](./manage-project-alerts#alert-settings) to suppress repeated alerts.

        - 🔧  The [dynamic field can be enabled for existing collections](./modify-collections#example-5-enable-dynamic-field) without collection recreations.

        - 💳  Subscription plans have been shifted to the project level, while clusters have several deployment options. Read [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) to find more.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[October 9, 2025](./release-notes-2510#milvus-v26x-public-preview)**

    </div>

    <div>

        - 🚀  Milvus v2.6.x becomes available on the Zilliz Cloud

            - [Field addition](./add-fields-to-an-existing-collection) without downtime

            - Enhanced full-text search with [multi-language analyzers](./multi-language-analyzers) and [phrase match](./phrase-match)

            - Accelerated JSON filtering with [JSON indexing](./json-indexing) and [Shredding](./json-shredding)

            - [Boost ranker](./boost-ranker) and [Decay rankers](./decay-ranker-oveview) for search result refinement

            - Support for [INT8_VECTOR data type](./use-dense-vector)

        - 💾  Tiered storage upgrade for extended capacity clusters

        - [🔄 Cross-region backup](./backup-to-other-regions) for business continuity strategy

        - [⚙️  Index build levels](./tune-index-build-level) for you to tailor index settings for scenarios

        - 🚧 Pipelines become deprecated

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[August 20, 2025](./release-notes-2508#autoscaling-upgrade)**

    </div>

    <div>

        - 📈  [Autoscaling upgrade](./auto-scaling) with simplified configuration

        - [📋  Audit logs](./audit-logs) become generally available

        - [🔐  SSO](./single-sign-on) experience improved

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[August 13, 2025](./release-notes-2508#support-aws-sydney-region)**

    </div>

    <div>

        - **New Region**: 🇦🇺 AWS Sydney (ap-southeast-2)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 15, 2025](./release-notes-2180)**

    </div>

    <div>

        - 🔗  Merge data API for schema evolution.

        - 📦  [Stage](./managed-volume) as a shared staging layer for migration and data import

        - 📅  [Schedule-based cluster autoscaling](./scheduled-scaling)

        - [🔄  Partial restoration](./restore-from-backup-files#restore-a-partial-cluster) of a cluster

        - [⚙️  JSON index](./json-indexing) settings on the Zilliz Cloud console

        - 📊  Quota settings for BYOC projects

        - 🔐  Restoration of RBAC settings during cluster restores

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 9, 2025](./release-notes-2170)**

    </div>

    <div>

        - 📚  [Migration docs and best practices](./migrate-between-clusters) refactored

        - [🚨  Policy-based alerts](./manage-project-alerts) for granular and flexible monitoring

        - ⚙️  mmap settings on the Zilliz Cloud console

        - ☁️  BYOC becomes available on the Google Cloud Platform (GCP)

        - 🤖  Well-designed AI assistant on your commands

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April 24, 2025](./release-notes-2150)**

    </div>

    <div>

        - ⚙️  Instance settings and AWS PrivateLink support for BYOC projects

        - 🔍  Fine-granular filtering on a JSON field using [JSON index](./json-indexing)

        - 🛠️  Use the RESTful API to [modify the replica count of your cluster](/reference/restful/modify-cluster-replica-v2).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[March 27, 2025](./release-notes-2140)**

    </div>

    <div>

        - 🔒 BYOC-I provides complete data sovereignty

        - [📋  Audit logs for your clusters](./audit-logs) become available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 27, 2025](./release-notes-2130)**

    </div>

    <div>

        - 🚀  Milvus v2.5.x becomes available on the Zilliz Cloud

        - [🔍  Full Text Search](./full-text-search) complements existing semantic search capability

        - [📋  Audit logs for your clusters](./audit-logs) become available

        - [☁️  BYOC on AWS](/docs/byoc/deploy-byoc-aws) with enhanced security

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 26, 2024](./release-notes-2120)**

    </div>

    <div>

        - 🎯  High recall rate by [turning the search level](./tune-recall-rate)

        - [🔐  Collection-level RBAC support](./cluster-privileges#collection-level-privilege-groups)

        - [💾  mmap](./use-mmap) support for expanded data capacity

        - [🗂️  Database](/docs/database) for multi-tenancy becomes available

        - **New Region**: 🇺🇸 GCP us-central1 (Iowa)

        - [☁️  BYOC](/docs/byoc/deploy-byoc-aws) becomes available on AWS

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[November 6, 2024](./release-notes-2110)**

    </div>

    <div>

        - 🎨  Zilliz Cloud console refactored

        - 🔄  Data migration with expanded sources: 

            - [Qdrant](./migrate-from-qdrant),

            - [Pinecone](./migrate-from-pinecone), and

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 💳  Improved payment process and redesigned [invoice page](./view-invoice)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[October 14, 2024](./release-notes-2102)**

    </div>

    <div>

        - [📚  Notebook gallery](https://zilliz.com/learn/milvus-notebooks) is online

        - ⚡  Performance-optimized clusters with expanded capacity

        - 🔄  [Multi-replica](./auto-scaling) becomes generally available

        - **New Region**: 🇯🇵 AWS Tokyo (ap-northeast-1)

        - [📊  Integrate with Prometheus](./prometheus-monitoring)

        - [🔑  Single sign-on (SSO)](./single-sign-on) with Auth0

        - 🎁  Free trail using AWS Marketplace

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[September 14, 2024](./release-notes-2100)**

    </div>

    <div>

        - ☁️  Serverless clusters become generally available

        - 🔄  [Multi-replica](./auto-scaling) becomes available for public preview

        - 📦  Migration service for you to migrate data to Zilliz Cloud:

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector), and

            - [Across Zilliz Cloud clusters](./offline-migration)

        - 🛠️  RESTful API endpoints for backup, restore, migration, and job management

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 23, 2024](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful API endpoints refactored

        - 🤖  Chatbot for easy information retrieval

        - [📋  One-stop job monitoring](./job-center) for backup, restore, migration, and data import

        - [📈  Autoscaling](./manage-cluster) becomes available for private preview

        - 🖼️  Pipelines enhanced with image searches

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 18, 2024](./release-notes-290)**

    </div>

    <div>

        - 🚀  Milvus v2.4.x becomes available on the Zilliz Cloud

            - [Sparse vector](./use-sparse-vector) data type support

            - Float16 & BFloat16 vector data type support

            - [Multi-vector hybrid search](./hybrid-search)

            - [Inverted index](./inverted-index-type) and [fuzzy match](./basic-filtering-operators)

            - [Grouping search](./grouping-search)

            - Refined MilvusClient interfaces

        - 📊  Pipelines now monitor token usage

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[May 15, 2024](./release-notes-280)**

    </div>

    <div>

        - ☁️  Serverless clusters are in beta now

        - **New Region**: 🇩🇪 Azure Germany West Central (Frankfurt)

        - **New Region**: 🇩🇪 GCP europe-west3 (Frankfurt) and 🇺🇸 us-east-4 (Virginia)

        - 🧠  Text pipelines and image pipelines become available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April 13, 2024](./release-notes-270)**

    </div>

    <div>

        - [🛒  Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) goes online

        - 🔌  Pipelines now support connectors

        - 🔄  Pipelines introduce rerankers for search pipelines

        - [📊  Metric monitoring through RESTful API](/reference/restful/query-metrics) is available

        - 🌐  Cross-cloud [data import](./data-import-zero-to-hero) and [migration](./migrate-between-clusters)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[March 13, 2024](./release-notes-260)**

    </div>

    <div>

        - 🧠  Pipelines now support more embedding models

        - 🎮  The collection playground becomes available on the Zilliz Cloud console

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 18, 2024](./release-notes-250)**

    </div>

    <div>

        - 📥  [Data import](./data-import-zero-to-hero) from Parquet files

        - [🔐  API keys](./manage-api-keys) enhanced with RBAC principles

        - 📊  [Metric boards and alert system](./metrics-alerts-reference) refactored

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 11, 2023](./release-notes-240)**

    </div>

    <div>

        - ☁️  Zilliz Cloud becomes available on Azure with the following regions:

            - **New Region**: 🇺🇸  Azure East US

        - 🚀  Pipelines become available in beta

        - 🔐  RBAC and credential management in your clusters

        - 🛠️  Cluster-related RESTful API endpoints

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[October 17, 2023](./release-notes-230)**

    </div>

    <div>

        - **New Region**: 🇩🇪 AWS Frankfurt (aws-en-central-1)

        - 🚀  Milvus v2.3.x becomes available for public preview

            - [Range search](./range-search)

            - [Upsert](./upsert-entities)

            - [Cosine metric type](./search-metrics-explained)

            - [Access control](./access-control-overview)

            - Raw vectors in return

            - [JSON_CONTAINS filter](./json-filtering-operators)

            - [Entity count](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[September 27, 2023](./release-notes-221)**

    </div>

    <div>

        - 💰  Support for advance pay

        - **New Region**: 🇺🇸 AWS US East 1 (aws-us-east-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[September 13, 2023](./release-notes-220)**

    </div>

    <div>

        - [🔄  Data migration across Zilliz Cloud clusters](./offline-migration)

        - [🚀  Easy migration from Elasticsearch](./migrate-from-elasticsearch)

        - [📥  Data import enhancements](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[August 16, 2023](./release-notes-210)**

    </div>

    <div>

        - **New Region**: 🇸🇬 AWS Singapore (ap-southeast-1)

        - **New Region**: 🇸🇬 GCP Singapore (asia-southeast-1)

        - 🔄  Migration support from serverless clusters to dedicated ones

        - 📤  Bulk insert support

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 11, 2023](./release-notes-200)**

    </div>

    <div>

        - ☁️  Serverless clusters become available

        - [💰  Zilliz Cloud plan tiers introduced](https://zilliz.com/pricing)

        - 👥  Organization, collaboration and RBAC for [access control](./access-control-overview)

        - 🏷️  Partition key for namespacing introduced

        - 📝  Dynamic schema becomes available

        - 📊  New data type: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April 6, 2023](./release-notes-110)**

    </div>

    <div>

        - [💰  Pricing calculator](https://zilliz.com/pricing#calculator)

        - 💾  [Back & restore](./create-backup) on GCP

        - [⏰  Custom timezone](./organization-settings#manage-timezone)

        - [🔄  Collection renaming](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[March 6, 2023](./release-notes-100)**

    </div>

    <div>

        - **New Region**: 🇺🇸 GCP Oregon (us-west1)

        - ☁️  Zilliz Cloud becomes available on the [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio)

        - [💾  Backup & Restore](./create-backup) becomes available on AWS

        - [🗑️  Recycle bin](./use-recycle-bin) for data continuity strategy

        - 🔄  [Migration from Milvus](./migrate-from-milvus)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[February 13, 2023](./release-notes-011)**

    </div>

    <div>

        - 📧  Email notifications

        - 📚  In-line guidance for beginners

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 10, 2023](./release-notes-010)**

    </div>

    <div>

        - 👁️  Data preview for collections

        - 📚  Demo dataset to help beginners get familiar with vector databases

    </div>

</Grid>

## 2022\{#2022}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 5, 2022](./release-notes-009)**

    </div>

    <div>

        - 🎨  Zilliz Cloud console with new design

        - **New Region**: 🇺🇸 AWS Ohio (us-east-2)

        - 🔐  [Private Link](./setup-a-private-link-aws) becomes available

        - 📥  [Data import](./data-import-zero-to-hero) becomes available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[November 18, 2022](./release-notes-008)**

    </div>

    <div>

        - 🚀  Zilliz Cloud opens to the public without invitation

        - ⚡  Capacity-optimized CUs go online

        - 📊  Resource monitors for QPS and query latency

        - 🛠️  AUTOINDEX to simplify indexing

        - ⚡  Optimize the UI performance for a better user experience

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **September 15, 2022**

    </div>

    <div>

        - 🎨  Collection view refactored

        - 🔍  Vector search view refactored

        - 🧑‍💻  Signup with Google becomes available

        - [⚙️  System maintenance settings](./organization-settings) become available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 30, 2022**

    </div>

    <div>

        - 📊  Larger standard vector database.

        - ⚙️  Managing collections on Cloud UI.

        - ⚙️  Managing index on Cloud UI.

        - 🔍  Executing vector search on Cloud UI.

        - 🔐  Disables database access from the Internet by default for security concerns.

        - 🔐  Improves whitelisting experience.

        - 💰  Supports credits.

        - 🚀  Improves Cloud UI for better interaction.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 1, 2022**

    </div>

    <div>

        - 👁️  Viewing collections on Cloud UI.

        - 👁️  Viewing collections schema on Cloud UI.

        - ➕  Creating collections on Cloud UI.

        - ➖  Deleting collections on Cloud UI.

        - 👁️  Viewing index on Cloud UI.

        - 🚀  Cloud UI for better interaction.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **July 22, 2022**

    </div>

    <div>

        - **New Region**: 🇺🇸 AWS Oregon (us-west-2)

        - ✅  Supports all Core Milvus features.

        - ⏸️  Supports suspending and resuming vector databases.

        - 📊  Supports viewing basic vector database metrics.

        - 👥  Supports database user management.

        - ➕  Supports creating multiple projects.

        - 🔐  Supports setting IP Whitelist at the project level.

        - 👁️  Supports viewing user operational events.

        - 🔐  Supports enabling MFA with email.

    </div>

</Grid>

