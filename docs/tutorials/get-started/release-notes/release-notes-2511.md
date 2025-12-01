---
title: " November 2025 Release Notes  | Cloud"
slug: /release-notes-2511
sidebar_label: " November 2025 Release Notes "
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: " November 2025 Release Notes  | Cloud"
type: origin
token: CK0ewQWC2iz6lakP0kscqogbnGh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  November 2025 Release Notes 

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-11-06**

    </div>

    <div>

        ## Business Critical Plan Availability\{#business-critical-plan-availability}

        Zilliz Cloud now offers the **Business Critical** plan, designed for organizations with the highest security, compliance, and availability requirements. In addition to our existing HIPAA and SOC 2 Type II readiness, this plan provides advanced capabilities such as Global Cluster, multi-region replication with automatic failover, and point-in-time recovery (PITR) to deliver stronger data protection, regulatory alignment, and operational resilience at global scale. For more information or to evaluate whether this plan is right for your environment, please [contact us](https://zilliz.com/contact-sales).

        ## Milvus v2.6.x New Features\{#milvus-v26x-new-features}

        - **Geometry data type support** — Store and query complex spatial shapes (POINT, LINESTRING, POLYGON) for geospatial search, geofencing, routing, and map-based applications. For details, refer to [Geometry Field](./use-geometry-field).

        - **Struct data type support** — Model nested, multi-attribute records more naturally to simplify schema design and improve querying in metadata-rich AI workloads. For details, refer to [Array of Structs](./use-array-of-structs).

        - **Enable Dynamic Field on existing collections** — Turn on dynamic field support without recreating the collection, allowing schema flexibility as business attributes evolve. For details, refer to [Modify Collection](./modify-collections#example-4-enable-dynamic-field).

        - **Support Deleting Scalar Indexes Under Loading Status** — Allow deleting and rebuilding scalar indexes while the collection is in loading status.

        ## Plan moved to the project level\{#plan-moved-to-the-project-level}

        With this release, subscription Plans are now managed at the **Project** level instead of the Cluster level, improving configuration consistency and simplifying capability governance—especially for organizations operating multiple clusters. 

        Your existing workloads, features, and billing remain unchanged, and no configuration updates are required.

        From now on, **new projects** will require a Plan selection (Standard, Enterprise, or Business Critical), while **Clusters** will choose a Deployment Option (Free, Serverless, or Dedicated). 

        For details, refer to the [Detailed Plan Comparison](./select-zilliz-cloud-service-plans).

        ## Enhancements\{#enhancements}

        - **Migration Support enabling Full text search** - Now you can enable BM25 function to best leverage full text search functionalities powered by Milvus when migrating from popular vector databases. For details, refer to [Migrate from Milvus to Zilliz Cloud Via Endpoint](./via-endpoint#getting-started) and [External Migration Basics](./external-migration-basics#configure-full-text-search-for-text-data).

        - **Alert Support Interval Setting -** You can customize the notification interval for ongoing alerts to ensure they remain noticeable without becoming disruptive. New alerts default to a one-hour interval. For details, refer to [Manage Project Alerts](./manage-project-alerts#alert-settings).

    </div>

</Grid>

