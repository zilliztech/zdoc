---
title: "Changelogs | Cloud"
slug: /changelogs
sidebar_label: "Changelogs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Last updated Dec 1, 2025 | Cloud"
type: origin
token: MUL3wkn7Yi3YoFkYk59csf8bnNc
sidebar_position: 16
keywords: 
  - zilliz
  - vector database
  - cloud
  - changelogs
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# Changelogs

**Last updated:** Dec 1, 2025

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Next releases**

    </div>

    <div>

        - Hosted embedding & reranking models via model provider integrations, and

        - Many new features become available in Prviate Preview.

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Dec 1, 2025**

    </div>

    <div>

        - 😘  Stage has been renamed to [Volume](./volume-explained), and becomes GA

        - [🔔  Organization-level IP Whitelist](./setup-console-ip-allowlist) becomes available

        - [🚀  ](./multi-factor-auth)[TOTP-based MFA](./multi-factor-auth) becomes available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **Nov 6, 2025**

    </div>

    <div>

        - Milvus v2.6.x becomes available on the Zilliz Cloud with more data types:

            - [Geometry](./use-geometry-field), and

            - [Array of Structs](./use-array-of-structs)

        - Full-text search capabilities are now available during [migrations](./via-endpoint#getting-started).

        - Customizing the [notification interval](./manage-project-alerts#alert-settings) to suppress repeated alerts.

        - The [dynamic field can be enabled for existing collections](./modify-collections#example-4-enable-dynamic-field) without collection recreations.

        - Subscription plans have been shifted to the project level, while clusters have several deployment options. Read [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) to find more.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **Oct 9, 2025**

    </div>

    <div>

        - Milvus v2.6.x becomes available on the Zilliz Cloud

            - [Field addition](./add-fields-to-an-existing-collection) without downtime

            - Enhanced full-text search with [multi-language analyzers](./multi-language-analyzers) and [phrase match](./phrase-match)

            - Accelerated JSON filtering with [JSON indexing](./json-indexing) and [Shredding](./json-shredding)

            - [Boost ranker](./boost-ranker) and [Decay rankers](./decay-ranker) for search result refinement

            - Support for [INT8_VECTOR data type](./use-dense-vector)

        - Tiered storage upgrade for extended capacity clusters

        - [Cross-region backup](./backup-to-other-regions) for business continuity strategy

        - [Index build levels](./tune-index-build-level) for you to tailor index settings for scenarios

        - 🚧 Pipelines become deprecated

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Aug 20, 2025**

    </div>

    <div>

        - [Autoscaling upgrade](./scale-cluster#dynamic-scaling) with simplified configuration

        - [Audit logs](./audit-logs) become generally available

        - [SSO](./single-sign-on) experience improved

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Aug 13, 2025**

    </div>

    <div>

        - **New Region**: 🇦🇺 AWS Sydney (ap-southeast-2)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **July 15, 2025**

    </div>

    <div>

        - [Merge data API](./merge-data) for schema evolution.

        - [Stage](./manage-stages) as a shared staging layer for migration and data import

        - [Schedule-based cluster autoscaling](./scale-cluster)

        - [Partial restoration](./restore-from-snapshot#restore-a-partial-cluster) of a cluster

        - [JSON index](./json-indexing) settings on the Zilliz Cloud console

        - Quota settings for BYOC projects

        - Restoration of RBAC settings during cluster restores

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **June 9, 2025**

    </div>

    <div>

        - [Migration docs and best practices](./migrations) refactored

        - [Policy-based alerts](./manage-project-alerts) for granular and flexible monitoring

        - mmap settings on the Zilliz Cloud console

        - BYOC becomes available on the Google Cloud Platform (GCP)

        - Well-designed AI assistant on your commands

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **April 24, 2025**

    </div>

    <div>

        - [Zero-downtime migration](./zero-downtime-migration) becomes available

        - Instance settings and AWS PrivateLink support for BYOC projects

        - Fine-granular filtering on a JSON field using [JSON index](./use-json-fields)

        - Use the RESTful API to [modify the replica count of your cluster](/reference/restful/modify-cluster-replica-v2).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **March 27, 2025**

    </div>

    <div>

        - BYOC-I provides complete data sovereignty

        - [Audit logs for your clusters](./audit-logs) become available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **January 27, 2025**

    </div>

    <div>

        - Milvus v2.5.x becomes available on the Zilliz Cloud

        - [Full Text Search](./full-text-search) complements existing semantic search capability

        - [Audit logs for your clusters](./audit-logs) become available

        - [BYOC on AWS](/docs/byoc/deploy-byoc-aws) with enhanced security

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **December 26, 2024**

    </div>

    <div>

        - High recall rate by [turning the search level](./tune-recall-rate)

        - [Collection-level RBAC support](./cluster-privileges#collection-level-privilege-groups)

        - [mmap](./use-mmap) support for expanded data capacity

        - [Database](/docs/database) for multi-tenancy becomes available

        - **New Region**: 🇺🇸 GCP us-central1 (Iowa)

        - [BYOC](/docs/byoc/deploy-byoc-aws) becomes available on AWS

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **November 6, 2024**

    </div>

    <div>

        - Zilliz Cloud console refactored

        - Data migration with expanded sources: 

            - [Qdrant](./migrate-from-qdrant),

            - [Pinecone](./migrate-from-pinecone), and

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - Improved payment process and redesigned [invoice page](./view-invoice)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **October 14, 2024**

    </div>

    <div>

        - [Notebook gallery](https://zilliz.com/learn/milvus-notebooks) is online

        - Performance-optimized clusters with expanded capacity

        - [Multi-replica](./manage-replica) becomes generally available

        - **New Region**: 🇯🇵 AWS Tokyo (ap-northeast-1)

        - [Integrate with Prometheus](./prometheus-monitoring)

        - [Single sign-on (SSO)](./single-sign-on) with Auth0

        - Free trail using AWS Marketplace

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **September 14, 2024**

    </div>

    <div>

        - Serverless clusters become generally available

        - [Multi-replica](./manage-replica) becomes available for public preview

        - Migration service for you to migrate data to Zilliz Cloud:

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector), and

            - [Across Zilliz Cloud clusters](./offline-migration)

        - RESTful API endpoints for backup, restore, migration, and job management

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **July 23, 2024**

    </div>

    <div>

        - RESTful API endpoints refactored

        - Chatbot for easy information retrieval

        - [One-stop job monitoring](./job-center) for backup, restore, migration, and data import

        - [Autoscaling](./manage-cluster) becomes available for private preview

        - Pipelines enhanced with image searches

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **June 18, 2024**

    </div>

    <div>

        - Milvus v2.4.x becomes available on the Zilliz Cloud

            - [Sparse vector](./use-sparse-vector) data type support

            - Float16 & BFloat16 vector data type support

            - [Multi-vector hybrid search](./hybrid-search)

            - [Inverted index](./index-scalar-fields) and [fuzzy match](./basic-filtering-operators#example-2-using-like-for-pattern-matching)

            - [Grouping search](./grouping-search)

            - Refined MilvusClient interfaces

        - Pipelines now monitor token usage

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **May 15, 2024**

    </div>

    <div>

        - Serverless clusters are in beta now

        - **New Region**: 🇩🇪 Azure Germany West Central (Frankfurt)

        - **New Region**: 🇩🇪 GCP europe-west3 (Frankfurt) and 🇺🇸 us-east-4 (Virginia)

        - Text pipelines and image pipelines become available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **April 13, 2024**

    </div>

    <div>

        - [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) goes online

        - Pipelines now support connectors

        - Pipelines introduce rerankers for search pipelines

        - [Metric monitoring through RESTful API](/reference/restful/query-metrics) is available

        - Cross-cloud [data import](./data-import) and [migration](./migrations)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **March 13, 2024**

    </div>

    <div>

        - Pipelines now support more embedding models

        - The collection playground becomes available on the Zilliz Cloud console

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **January 18, 2024**

    </div>

    <div>

        - [Data import](./data-import) from Parquet files

        - [API keys](./manage-api-keys) enhanced with RBAC principles

        - [Metric boards and alert system](./metrics-and-alerts) refactored

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **December 11, 2023**

    </div>

    <div>

        - Zilliz Cloud becomes available on Azure with the following regions:

            - **New Region**: 🇺🇸  Azure East US

        - Pipelines become available in beta

        - RBAC and credential management in your clusters

        - Cluster-related RESTful API endpoints

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **October 17, 2023**

    </div>

    <div>

        - **New Region**: 🇩🇪 AWS Frankfurt (aws-en-central-1)

        - Milvus v2.3.x becomes available for public preview

            - [Range search](./range-search)

            - [Upsert](./upsert-entities)

            - [Cosine metric type](./search-metrics-explained)

            - [Access control](./access-control)

            - Raw vectors in return

            - [JSON_CONTAINS filter](./json-filtering-operators)

            - [Entity count](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **September 27, 2023**

    </div>

    <div>

        - Support for advance pay

        - **New Region**: 🇺🇸 AWS US East 1 (aws-us-east-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **September 13, 2023**

    </div>

    <div>

        - [Data migration across Zilliz Cloud clusters](./offline-migration)

        - [Easy migration from Elasticsearch](./migrate-from-elasticsearch)

        - [Data import enhancements](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 16, 2023**

    </div>

    <div>

        - **New Region**: 🇸🇬 AWS Singapore (ap-southeast-1)

        - **New Region**: 🇸🇬 GCP Singapore (asia-southeast-1)

        - Migration support from serverless clusters to dedicated ones

        - Bulk insert support

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **June 11, 2023**

    </div>

    <div>

        - Serverless clusters become available

        - [Zilliz Cloud plan tiers introduced](https://zilliz.com/pricing)

        - Organization, collaboration and RBAC for [access control](./access-control)

        - Partition key for namespacing introduced

        - Dynamic schema becomes available

        - New data type: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **April 6, 2023**

    </div>

    <div>

        - [Pricing calculator](https://zilliz.com/pricing#calculator)

        - [Back & restore](./backup-and-restore) on GCP

        - [Custom timezone](./organization-settings#manage-timezone)

        - [Collection renaming](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **March 6, 2023**

    </div>

    <div>

        - **New Region**: 🇺🇸 GCP Oregon (us-west1)

        - Zilliz Cloud becomes available on the [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio)

        - [Backup & Restore](./backup-and-restore) becomes available on AWS

        - [Recycle bin](./use-recycle-bin) for data continuity strategy

        - [Migration from Milvus](./migrations)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **February 13, 2023**

    </div>

    <div>

        - Email notifications

        - In-line guidance for beginners

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **January 10, 2023**

    </div>

    <div>

        - Data preview for collections

        - Demo dataset to help beginners get familiar with vector databases

    </div>

</Grid>

## 2022\{#2022}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **December 5, 2022**

    </div>

    <div>

        - Zilliz Cloud console with new design

        - **New Region**: 🇺🇸 AWS Ohio (us-east-2)

        - [Private Link](./setup-a-private-link) becomes available

        - [Data import](./data-import) becomes available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **November 18, 2022**

    </div>

    <div>

        - Zilliz Cloud opens to the public without invitation

        - Capacity-optimized CUs go online

        - Resource monitors for QPS and query latency

        - AUTOINDEX to simplify indexing

        - Optimize the UI performance for a better user experience

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **September 15, 2022**

    </div>

    <div>

        - Collection view refactored

        - Vector search view refactored

        - Signup with Google becomes available

        - [System maintenance settings](./organization-settings) become available

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 30, 2022**

    </div>

    <div>

        - Larger standard vector database.

        - Managing collections on Cloud UI.

        - Managing index on Cloud UI.

        - Executing vector search on Cloud UI.

        - Disables database access from the Internet by default for security concerns.

        - Improves whitelisting experience.

        - Supports credits.

        - Improves Cloud UI for better interaction.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 1, 2022**

    </div>

    <div>

        - Viewing collections on Cloud UI.

        - Viewing collections schema on Cloud UI.

        - Creating collections on Cloud UI.

        - Deleting collections on Cloud UI.

        - Viewing index on Cloud UI.

        - Cloud UI for better interaction.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **July 22, 2022**

    </div>

    <div>

        - **New Region**: 🇺🇸 AWS Oregon (us-west-2)

        - Supports all Core Milvus features.

        - Supports suspending and resuming vector databases.

        - Supports viewing basic vector database metrics.

        - Supports database user management.

        - Supports creating multiple projects.

        - Supports setting IP Whitelist at the project level.

        - Supports viewing user operational events.

        - Supports enabling MFA with email.

    </div>

</Grid>

