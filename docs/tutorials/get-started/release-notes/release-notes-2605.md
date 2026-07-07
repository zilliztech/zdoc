---
title: "May 2026 Release Notes | Cloud"
slug: /release-notes-2605
sidebar_label: "May, 2026"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: NRF1wGr3AiWWC1kVfWucZD6Xneb
sidebar_position: 3
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# May 2026 Release Notes

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-13**

    </div>

    <div>

        ## [BYOC] Multi-Dataplane Support\{#byoc-multi-dataplane-support}

        Zilliz Cloud BYOC now supports multiple dataplanes within a single project. A BYOC project can now span multiple regions, with each dataplane representing a region-specific infrastructure unit.

        - **Multiple dataplanes** under one BYOC project, with a **new dataplane page** for dataplane management

        - Create clusters by selecting a target region/dataplane within the project.

        Existing BYOC projects remain compatible and require no data migration. A current BYOC project will continue to work as a project with one dataplane.

        For details, you can read [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws), [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws), [Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure), and [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## Vector Lakebase Public Preview\{#vector-lakebase-public-preview}

        In this major release, Zilliz Cloud evolves from a vector database product into a Vector Lakebase platform.

        After the upgrade, the original vector database service becomes the real-time serving layer for latency-critical workloads, while the platform expands its overall data and compute capabilities to better support the semantic search and analytics workflow loop required by modern AI and agent applications.

        Vector Lakebase builds on an S3-based unified data foundation to power AI and agent workloads across three access modes:

        - **Real-time Retrieval** for latency-critical production serving,

        - **Iterative Discovery** for interactive and multi-step exploration,

        - **Batch Analytics** for offline mining and dataset optimization.

        Vector Lakebase is built on a fully decoupled storage–compute architecture. Data lives in Databases — project-level vector stores independent of any compute cluster — where teams can store unlimited vectors together with text, JSON, labels, geospatial data, and other types of attributes.

        In particular, Zilliz Vector Lakebase introduces several key capabilities:

        **On-Demand Search**

        Interactive discovery and batch analytics often operate on datasets one to three orders of magnitude larger than online serving, including feedback data, logs, agent notes, and crawled corpora. These workloads are typically task-driven rather than continuously active, with compute resources remaining idle over 97% of the time. As a result, using large always-on vector database clusters is often hard to justify from a cost perspective.

        Zilliz On-Demand Search charges directly for object storage and on-demand compute — similar to AWS Lambda, where pricing is primarily based on allocated resource size and execution time, while storage cost remains close to the underlying S3 cost.

        For these non-always-on workloads, both On-Demand Search and Serverless follow a pay-as-you-go model. However, as our experiment shows, for a 1B-vector workload with 10 hours of accumulated active compute per month, the total cost of On-Demand Search is only about 1/15 that of Serverless (&#36;318 vs. &#36;4,937).

        For details, please refer to [Quickstart to On-Demand Search](./quick-start-to-on-demand-search) and [On-Demand Compute Cost](./on-demand-compute-cost).

        **External Data Lake Search**

        Zilliz Vector Lakebase provides fully managed storage and query compute, while also supporting customers with existing data lake infrastructure and governance pipelines.

        For AI workloads, the key challenge is enabling efficient retrieval and semantic exploration directly on top of lake data. Traditional systems such as Spark and Ray are optimized for full-data scan and map-reduce computation, rather than index-accelerated semantic retrieval.

        To address this, Zilliz provides an External Collection mode — a zero-copy logical mapping to customer-owned lake tables with high-performance indexing and full-spectrum search capabilities built on top.

        Learn how to index and accelerate your existing data lake, refer to [Quickstart to External Data Lake Search](./quick-start-to-external-data-lake-search).

        Vector Lakebase is accessible through the Zilliz Cloud console, REST API, PyMilvus, and Zilliz CLI. It introduces usage-based billing across compute, storage, and storage requests — including Query CU, Indexing CU, Project Database Storage, and Storage Requests.

        ## Milvus 3.0 Public Preview\{#milvus-30-public-preview}

        Alongside the launch of Vector Lakebase, Zilliz is also releasing the public preview of Milvus 3.0. In this version, Milvus extends its vector database capabilities into the AI data infrastructure stack through open data formats and broader integration with existing data lakes and large-scale data processing engines.

        <Admonition type="info" icon="📘" title="Notes">

        In this release, Milvus 3.0 capabilities are supported on On-demand Clusters only. Serving Clusters are not yet supported.

        </Admonition>

        **External data and storage formats**

        - **External Collection** — Reference data directly on object storage (Parquet, Lance, Vortex, and Iceberg) without copying it into Milvus. Milvus manages schema, indexes, and query execution only. An incremental Refresh keeps the collection in sync with source file changes, and a single dataset can be served from multiple instances simultaneously. 

            For details, refer to External Collection.

        - **External Backfill** *(Private Preview)*  — Upgrade an embedding model on a live collection without downtime. Add a new vector field via `AddCollectionField`, freeze a consistent starting point with Snapshot, run the embedding job offline, and write values back through normal ingestion paths. The application switches over once the new column is indexed.

            *To join the Private Preview for External Backfill, [contact us](https://zilliz.com/contact-sales).*

        **Schema and data modeling**

        - **Null Vector** — Allows vector fields to be nullable across all six vector types. NULL rows are skipped during search automatically with no impact on retrieval quality, and NULL vectors consume effectively no storage. Existing collections can add new nullable vector columns online via `AddCollectionField` without a rebuild.

            For details, refer to [Nullable Fields](./nullable-fields) and [Default Values](./default-fields).

        - **EmbList + DiskANN**  — Stores a variable-length vector list per entity, indexed on disk via DiskANN. Suited for long documents, late-interaction models like ColBERT, and multimodal entities — keeping RAM under control at large corpus sizes.

            For details, refer to [StructArray](./undefined) and [StructArray Operators](./struct-array-filtering).

        - **MinHash DIDO (Doc-in, Doc-out)**  — Adds a server-side MinHash function to MINHASH_LSH. Milvus automatically computes signatures during insert, bulk-insert, and search — no application-side preprocessing needed for deduplication, fingerprinting, and plagiarism detection workflows.

            For details, refer to [MinHash Function](./minhash-function).

        **Search and ranking controls**

        - **Query / Search Order By** — Multi-field ordering for search and query results, with per-field ASC / DESC, pushed down into the kernel. No more over-fetching and client-side re-sorting for composite ranking.

            For details, refer to [Basic Vector Search](./single-vector-search#sort-search-results-by-scalar-fields), [Grouping Search](./grouping-search#order-groups-by-a-scalar-field), and [Query](./get-and-scalar-query#sort-query-results).

        **Data lifecycle and operations**

        - **Snapshot** — A point-in-time, read-only view of a collection that references existing segments without copying data. Batch jobs run under MVCC-style isolation while the live collection keeps taking writes — suited for A/B evaluation, deduplication, and backfill validation.

            For details, refer to [Snapshots](./snapshots) and [Manage Snapshots](./manage-snapshots).

        - **Entity TTL (Row-level TTL)** — Per-row expiration via a `Timestamptz` TTL field. Expired rows are reclaimed automatically, covering retention compliance, session data, and conversation history — no application-side cleanup needed.

             For details, refer to [Set Collection TTL](./set-collection-ttl)

        - **Force Merge** — Explicitly triggers segment compaction during off-peak windows (synchronous or asynchronous), reducing query-latency jitter and storage overhead from segment fragmentation.

        **Text and Spark-powered data processing**

        - **Custom dictionaries and tokenizers** *(Private Preview)* — Register custom tokenizer dictionaries, synonym lists, stop-word lists, and decompounder rules via a FileResource mechanism. Takes effect on BM25, the analyzer, and Text Match — centrally versioned instead of scattered across application code.

        - **Spark Semantic Dedup** *(Private Preview)* — Support semantic deduplication for large-scale Spark data processing.

        - **Spark Abnormal Detection** *(Private Preview)* — Detect abnormal records or patterns during Spark-based data processing.

            *To join the Private Preview for any of the above features, [contact us](https://zilliz.com/contact-sales).*

        ## External Volumes\{#external-volumes}

        Zilliz Cloud now supports External Volumes in addition to Managed Volumes. An External Volume is a read-only reference to a bucket or path in your own cloud object storage, letting Zilliz Cloud read source data in place for import, migration, and external-collection workflows — without copying data into Zilliz Cloud first.

        - **Use data where it already lives** — Point an External Volume to an AWS S3 or Google Cloud Storage path. Data stays in your bucket; Zilliz Cloud reads it only when needed.

        - **Controlled, regional access** — Access is managed through Storage Integration and Zilliz Cloud RBAC, ensuring only authorized project users can create or manage External Volumes.

        For details, refer to [External Volumes](./external-volume).

        ## Large TopK\{#large-topk}

        Large TopK is now supported at the collection level, expanding the maximum number of returned entities from 16,384 to 1,000,000 for enabled collections. Available on both Serving Cluster and On-demand Compute, it is ideal for data mining and batch analysis workloads — enabling broader candidate recall for use cases such as candidate generation, model evaluation, and large-scale similarity search.

        For details, refer to [Use Large TopK](./use-large-topk).

        ## Enhancements\{#enhancements}

        - **Region-aware project governance** — Projects now include regional constraints to help enterprises manage data residency and keep regional data-plane access explicit. The region model is reflected in both the Zilliz Cloud console and APIs.

        - **Zilliz CLI updates** — Zilliz CLI has been updated to cover the changes in this release, including Lakebase, External Volumes, region-aware operations, and pricing-related updates. Refer to the [Zilliz CLI](https://github.com/zilliztech/zilliz-cli) experience for details.

    </div>

</Grid>

