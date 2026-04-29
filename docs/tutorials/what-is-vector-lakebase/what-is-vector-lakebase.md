---
title: "What is Vector Lakebase? | Cloud"
slug: /what-is-vector-lakebase
sidebar_key: what-is-vector-lakebase
sidebar_label: "What is Vector Lakebase?"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "A vector database efficiently stores, indexes, and searches for high-dimensional vectors. Unlike traditional databases that query by exact matches or range scans, vector databases solve a different problem given a query vector, they find the most similar vectors in the dataset. | Cloud"
type: origin
token: YNq1wQVkui50CSk83DXcsxD8nfd
sidebar_position: 2
keywords: 
  - zilliz
  - vector lakebase
  - get started

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# What is Vector Lakebase?

A vector database efficiently stores, indexes, and searches for high-dimensional vectors. Unlike traditional databases that query by exact matches or range scans, vector databases solve a different problem: given a query vector, they find the most similar vectors in the dataset.

This operation, approximate nearest neighbor (ANN) search, underpins most modern AI. When a language model retrieves documents, a recommendation engine finds similar products, or an image search matches a photo, the system is comparing embeddings: numerical representations of unstructured data. A vector database makes these comparisons fast and scalable.

But "*fast and scalable*" is not a single point on a map. It is a set of tradeoffs between latency, throughput, recall, and cost. Over the past eight years, the industry has learned that the hardest tradeoff is not performance. It is economics.

## Lakebase at a glance\{#lakebase-at-a-glance}

Lakebase is a compute layer for vector search that operates directly on your data lake. Rather than importing embeddings into a managed black box, it brings compute to the data: indexing and querying vectors where they already live in your own storage system.

**Why this matters**

Traditional vector databases are memory-bound systems that require always-on infrastructure. A 100-million-vector index consumes about 340 GB of RAM and must be loaded across dedicated query nodes before a single search can run. For a workload that is active for just 5 hours a month, you still pay for the other 715 hours, a pure waste.

Lakebase changes economics. The same workload that costs about &#36;24,000 per year in self-hosted infrastructure costs about &#36;240 per year with Lakebase. The trade-off is a 5- to 10-second cold start per session, rather than millisecond hot-path latency.

**The trade-off at a glance**

<table>
   <tr>
     <th><p>Workload pattern</p></th>
     <th><p>Recommended model</p></th>
     <th><p>Latency</p></th>
     <th><p>Cost</p></th>
   </tr>
   <tr>
     <td><p>Always-on production traffic, high QPS</p></td>
     <td><p>Serving Cluster</p></td>
     <td><p>Sub-100 ms</p></td>
     <td><p>Always-on (traditional)</p></td>
   </tr>
   <tr>
     <td><p>Experiments, batch search, sporadic RAG, cold archival</p></td>
     <td><p>On-demand Compute</p></td>
     <td><p>5–10 s cold start</p></td>
     <td><p>Pay per query, scales to zero</p></td>
   </tr>
</table>

**Recommended adoption path**

1. Start with an external collection to explore existing datasets, validate recall, and tune parameters. You are billed by the compute unit and by the second.

1. When you are ready to serve production traffic, copy the collection to a Serving Cluster. The data does not move. Only the compute profile changes.

**Decision ask**

Evaluate your current vector search workloads. If more than 20% of your infrastructure spend supports idle indexes, benchmark Lakebase on-demand compute against your existing always-on footprint.

## Architecture overview\{#architecture-overview}

Lakebase is designed around a single architectural premise: **completely separate data from compute.** Creating or destroying a compute resource never affects the data or its permissions.

![NUDjbHSEfoAhWIxGTJPc82Mknke](https://zdoc-images.s3.us-west-2.amazonaws.com/nudjbhsefoahwixgtjpc82mknke.png "NUDjbHSEfoAhWIxGTJPc82Mknke")

### Persistent layer\{#persistent-layer}

The data layer has two core abstractions:

- **Volume**: a pointer to a storage location plus credentials. It knows *where* the data lives, not the format. Volumes can be external (your S3 bucket) or managed (Zilliz Cloud).

- **Database / Collection**: the logical namespace for vector data. Collections can be *external* (zero-copy indexing of existing Parquet, Lance, or Iceberg files) or native (a Milvus-compatible managed format).

Because the persistent layer is decoupled from compute, your embeddings can live in S3 alongside the rest of your data lake. Lakebase brings compute to them only when you search.

### Compute layer\{#compute-layer}

Compute is split into two independent planes:

<table>
   <tr>
     <th><p>Plane</p></th>
     <th><p>Purpose</p></th>
     <th><p>Lifecycle</p></th>
     <th><p>Latency profile</p></th>
   </tr>
   <tr>
     <td><p><strong>Serving Cluster</strong></p></td>
     <td><p>Always-on production queries</p></td>
     <td><p>Persistent</p></td>
     <td><p>Sub-100 ms</p></td>
   </tr>
   <tr>
     <td><p><strong>On-demand Compute</strong></p></td>
     <td><p>Batch search, ETL, exploration</p></td>
     <td><p>Ephemeral; auto-stops when idle</p></td>
     <td><p>5–10 s cold start, then full throughput</p></td>
   </tr>
</table>

Both planes share the same data layer. You do not copy data between offline analytics and online search. You attach different compute profiles to the same collections.

### Control and access\{#control-and-access}

RBAC is enforced at both layers. Policies govern who can read or write data, and separate policies govern who can provision compute. This separation allows security teams to manage access once, while data engineers can create new volumes and clusters freely.

<Admonition type="info" icon="📘" title="Notes">

<p>From here on, the document covers implementation details, indexing strategies, and operational specifics. </p>

</Admonition>

## Vector search economics\{#vector-search-economics}

Vector databases have historically been memory-bound systems. Consider a concrete workload: **100 million vectors, 768 dimensions, float32 precision**. The raw vector data alone is about **286 GB**. Building an index on top adds another **~55 GB**. The total index is about **340 GB**.

In a traditional vector database architecture, indexes require a set of resident query nodes before you can query the collection. Spreading across **three machines with 128 GB of RAM each**, those nodes run 24/7:

![GgnIb2drhoJg6hx4E8VcGi4Unfe](https://zdoc-images.s3.us-west-2.amazonaws.com/ggnib2drhojg6hx4e8vcgi4unfe.png "GgnIb2drhoJg6hx4E8VcGi4Unfe")

This design made sense when vector databases served always-on recommendation systems and high-QPS retrieval. But AI changed the demand pattern.

Product teams now run two-week A/B experiments, after which the embeddings are never queried again. In SaaS products, most users do not log in every week. In RAG knowledge bases, most documents are rarely accessed. The data is not useless. It might be queried at any time, but it is queried *rarely*. Traditional databases handle this with tiering: hot data in memory, cold on disk, paged in on demand. Vector databases had no such concept. Either the entire collection was loaded, or it was not queryable.

The cost trap is real. **For a workload that runs for five hours a month, you were paying for the other 715 wasted hours.**

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Budget impact:</strong> A 100-million-vector workload active only 5 hours per month costs the same on traditional infrastructure as one running 24/7. The always-on nodes never scale down.</p>

</Admonition>

The root cause is physics, not design. S3 read latency is 20-50 ms per request. Index traversal touches hundreds of nodes per query. Put those numbers together, and the conclusion is unavoidable: vector indexes must reside in local memory. The question is not whether to cache. It is how to make the uncached case viable.

### CS/CD Loop\{#cscd-loop}

**Lakebase** is built on a different premise: *your data stays where it is. Bring vector compute to it.* 

Rather than importing data into a managed black box, Lakebase treats object storage as the source of truth. It is designed specifically for the **AI CS/CD loop**, a continuous cycle of serving and discovery:

- **Continuous Serving (CS)**: The always-on AI service that serves users and produces interaction data.

- **Continuous Discovery (CD)**: The on-demand analysis, evaluation, and experimentation that turns that data into insight and feeds improvements back into serving.

![KYpMbYHD7oQFPtxdeoGcG9CFnFg](https://zdoc-images.s3.us-west-2.amazonaws.com/kypmbyhd7oqfptxdeogcg9cfnfg.png "KYpMbYHD7oQFPtxdeoGcG9CFnFg")

Both serving and discovery share the same data layer. The data itself stays in S3; you do not export, import, or duplicate it between offline analytics and online search. You only attach different compute profiles to the same dataset.

This architecture redefines what a vector database is. A traditional system guards data behind dedicated, always-on infrastructure. Lakebase is different. It is a compute layer that arrives on demand, performs vector operations directly on your lakehouse data, and releases resources when the work is done.

### Solving the four barriers\{#solving-the-four-barriers}

Moving compute to object storage requires solving four technical obstacles that have blocked previous attempts at diskless vector search.

#### Barrier 1: Cold start was too slow\{#barrier-1-cold-start-was-too-slow}

<table>
   <tr>
     <th><p>Problem</p></th>
     <th><p>Loading a 340 GB index from S3 takes minutes. Minutes of cold start kill any on-demand use case.</p></th>
   </tr>
   <tr>
     <td><p>Mechanism</p></td>
     <td><p>Lakebase compresses the index using multi-layer quantization. A lightweight first layer loads in seconds and answers queries immediately; a full-precision layer downloads in the background and refines the results.</p></td>
   </tr>
   <tr>
     <td><p>Outcome</p></td>
     <td><p>Cold start drops from minutes to 5–10 seconds, making pay-per-query economics viable.</p></td>
   </tr>
</table>

#### Barrier 2: Scanning 100 million vectors\{#barrier-2-scanning-100-million-vectors}

<table>
   <tr>
     <th><p>Problem</p></th>
     <th><p>Even a compressed index is too large to scan linearly for every query. In a diskless model, slow queries keep compute nodes alive longer, eroding cost savings.</p></th>
   </tr>
   <tr>
     <td><p>Mechanism</p></td>
     <td><p>Global index pruning with clustering. At index time, vectors are grouped into buckets. At query time, only the nearest buckets are searched.</p></td>
   </tr>
   <tr>
     <td><p>Outcome</p></td>
     <td><p>Each query scans about 3% of the data. Query nodes can be reclaimed almost immediately after the query completes.</p></td>
   </tr>
</table>

#### Barrier 3: Retrieve was amplifying S3 I/O\{#barrier-3-retrieve-was-amplifying-s3-io}

<table>
   <tr>
     <th><p>Problem</p></th>
     <th><p>Vector search returns IDs, not raw vectors. Fetching the original data requires a second round of reads. Standard columnar formats force you to download large row groups to retrieve a single record, creating massive read amplification.</p></th>
   </tr>
   <tr>
     <td><p>Mechanism</p></td>
     <td><p>Lakebase stores data in an open columnar format designed for direct point queries on compressed data, without forcing large row group downloads.</p></td>
   </tr>
   <tr>
     <td><p>Outcome</p></td>
     <td><p>S3 traffic per point read drops by two orders of magnitude compared to standard formats.</p></td>
   </tr>
</table>

#### Barrier 4: Control plan costs did not scale to zero\{#barrier-4-control-plan-costs-did-not-scale-to-zero}

<table>
   <tr>
     <th><p>Problem</p></th>
     <th><p>Even when all query nodes are idle, traditional systems keep a dedicated coordinator and metadata store running per tenant. At scale, this overhead exceeds compute cost.</p></th>
   </tr>
   <tr>
     <td><p>Mechanism</p></td>
     <td><p>A shared regional control plane replaces per-tenant coordinators. All tenants share one set of control infrastructure.</p></td>
   </tr>
   <tr>
     <td><p>Outcome</p></td>
     <td><p>Control plane cost is constant regardless of tenant count. Query nodes scale to zero; when idle, tenants pay only for S3 storage.</p></td>
   </tr>
</table>

### From cost barrier to capability enabler\{#from-cost-barrier-to-capability-enabler}

The economics matter, but the real shift is what becomes possible. The same workload that cost &#36;24,000 per year in self-hosted infrastructure now costs about **&#36;240 per year** in Lakebase diskless mode. The trade-off is a 5- to 10-second cold start per session instead of millisecond hot latency.

For always-on production traffic, Serving Clusters still deliver the sub-100ms latency users expect. For everything else (experiments, monthly reports, sporadic RAG retrieval, cold archival search), the on-demand path removes the cost barrier entirely.

When cost is no longer the limiting factor, behavior changes. Teams index more data. They run more experiments. They keep the embeddings they would have deleted. A lower price doesn't just save money. It increases demand.

That is what a modern vector database is. It is not simply a faster index. It is an elastic compute layer that arrives when you need it, operates directly on your data lake, and disappears when you don't. Vector search stops being infrastructure you maintain. It becomes a capability you invoke.

## Main features\{#main-features}

Lakebase combines the capabilities of a vector database with the economics of a data lakehouse. The main features are:

- **Zero-copy indexing**: Build ANN indexes directly on existing Parquet, Lance, and Iceberg files in S3. No import, no ETL, no format conversion.

- **Pay-per-query economics**: On-demand searches are billed by CU and second. If you query for five hours a month, you pay for five hours. Not 720.

- **Progressive upgrade path**: Start with batch exploration on external collections in on-demand compute clusters and databases. Validate, tune, and refine. Copy to a Serving Cluster when you need always-on, low-latency performance.

- **True multi-tenancy with scale-to-zero**: One million tenants can share a single regional control plane. 99% of them pay only for S3 storage; compute is 0 when idle.

- **External and managed volumes**: Bring your own S3 buckets, or use fully managed storage. Credentials are managed separately and are reusable.

- **GPU-accelerated index builds**: Distributed index construction scales to billion-vector datasets without requiring a single machine to hold everything in memory.

- **High recall at low cost**: Multi-layer quantization + IVF pruning delivers 95%+ recall while scanning only a fraction of the dataset.

## Decision matrix\{#decision-matrix}

This section provides actionable guidance for choosing between Lakebase compute models, storage models, and adoption paths.

### Compute model decision\{#compute-model-decision}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Recommendation</p></th>
     <th><p>Rationale</p></th>
   </tr>
   <tr>
     <td><p>Sub-100 ms latency, always-on traffic, high QPS</p></td>
     <td><p><strong>Serving Cluster</strong></p></td>
     <td><p>Persistent query nodes keep indexes hot in memory. You pay for uptime, not per query.</p></td>
   </tr>
   <tr>
     <td><p>Batch search, ETL jobs, interactive exploration</p></td>
     <td><p><strong>On-demand Compute</strong></p></td>
     <td><p>Ephemeral clusters spin up per job and auto-stop. Billed by CU and second.</p></td>
   </tr>
   <tr>
     <td><p>Sporadic RAG retrieval, cold archival, A/B tests</p></td>
     <td><p><strong>On-demand Compute</strong></p></td>
     <td><p>Cold start (5–10 s) is acceptable for infrequent queries. Cost scales to zero when idle.</p></td>
   </tr>
   <tr>
     <td><p>Mixed: mostly batch with occasional real-time</p></td>
     <td><p><strong>Both</strong></p></td>
     <td><p>Explore and validate on Project Database Endpoint; copy to Serving Cluster when ready.</p></td>
   </tr>
</table>

### Storage model decision\{#storage-model-decision}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Recommendation</p></th>
     <th><p>Rationale</p></th>
   </tr>
   <tr>
     <td><p>Existing data lake in Parquet, Lance, or Iceberg</p></td>
     <td><p><strong>External Collection</strong></p></td>
     <td><p>Zero-copy indexing. No import, no ETL, no format conversion.</p></td>
   </tr>
   <tr>
     <td><p>Greenfield project, no existing lakehouse</p></td>
     <td><p><strong>Managed Collection</strong></p></td>
     <td><p>Fully managed, Milvus-compatible, simplest operational path.</p></td>
   </tr>
   <tr>
     <td><p>Need to share embeddings with Spark, Databricks, or other lakehouse tools</p></td>
     <td><p><strong>External Collection</strong></p></td>
     <td><p>Data stays in open formats that other tools can read directly.</p></td>
   </tr>
   <tr>
     <td><p>Migrating from self-hosted Milvus</p></td>
     <td><p><strong>Managed Collection</strong></p></td>
     <td><p>API-compatible drop-in replacement.</p></td>
   </tr>
</table>

### Progressive adoption path\{#progressive-adoption-path}

![HQW8bPZgYovZzjx1rJfclAD1nHd](https://zdoc-images.s3.us-west-2.amazonaws.com/hqw8bpzgyovzzjx1rjfclad1nhd.png "HQW8bPZgYovZzjx1rJfclAD1nHd")

<Procedures>

1. **Connect**: Create a Volume that points to your S3 data. Set up Storage Integration (IAM role) once.

1. **Explore**: Use the Project Database Endpoint with on-demand compute to run batch searches and schema operations. Pay only for the compute seconds used.

1. **Validate**: Measure recall, tune index parameters, and refine your dataset. No data movement required.

1. **Serve**: Copy the validated collection to a Serving Cluster. This is a metadata operation, not a data migration.

</Procedures>

### Cost comparison summary\{#cost-comparison-summary}

<table>
   <tr>
     <th><p>Cost driver</p></th>
     <th><p>Traditional Vector DB</p></th>
     <th><p>Lakebase Serving</p></th>
     <th><p>Lakebase On-demand</p></th>
   </tr>
   <tr>
     <td><p>Infrastructure</p></td>
     <td><p>Always-on RAM-bound nodes</p></td>
     <td><p>Always-on (serverless or dedicated)</p></td>
     <td><p>Ephemeral; scales to zero</p></td>
   </tr>
   <tr>
     <td><p>Idle cost</p></td>
     <td><p>Full node cost 24/7</p></td>
     <td><p>Reduced with serverless, but non-zero</p></td>
     <td><p>Zero</p></td>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>Local SSD / EBS</p></td>
     <td><p>S3</p></td>
     <td><p>S3</p></td>
   </tr>
   <tr>
     <td><p>Typical annual cost (100M vectors, 5 hrs/month query)</p></td>
     <td><p>&#126;&#36;24,000</p></td>
     <td><p>Similar to traditional always-on</p></td>
     <td><p>&#126;&#36;240</p></td>
   </tr>
   <tr>
     <td><p>Cold start</p></td>
     <td><p>None (always hot)</p></td>
     <td><p>None (always hot)</p></td>
     <td><p>5–10 seconds</p></td>
   </tr>
   <tr>
     <td><p>Best for</p></td>
     <td><p>Legacy always-on workloads</p></td>
     <td><p>Production AI services</p></td>
     <td><p>Experiments, batch, archival</p></td>
   </tr>
</table>



import DocCardList from '@theme/DocCardList';

<DocCardList />