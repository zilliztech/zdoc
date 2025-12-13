---
title: " October 2025 Release Notes | Cloud"
slug: /release-notes-2510
sidebar_label: " October 2025 Release Notes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: " October 2025 Release Notes | Cloud"
type: origin
token: PmaowiSUaiTa8ckPMYJcqdRYnQg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  October 2025 Release Notes

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-10-09**

    </div>

    <div>

        ## Milvus v2.6.x Public Preview\{#milvus-v26x-public-preview}

        With this release, **Milvus v2.6.x clusters** are now available in **Public Preview** on Zilliz Cloud, featuring multiple enhancements and optimizations that improve stability, efficiency, and flexibility.

        - **Field addition without downtime** — Add new fields to collections on the fly, without schema workarounds. For details, refer to [Add Fields to an Existing Collection](./add-fields-to-an-existing-collection).

        - **Enhanced full-text search** — Up to **4× faster** than Elasticsearch, with multi-language support and phrase match functionalities. For details, refer to [Multi-language Analyzers](./multi-language-analyzers), [Phrase Match](./phrase-match), and [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case).

        - **Accelerated JSON filtering** — Run complex, nested metadata queries up to **100× faster** with **JSON indexing** and **shredding**. For details, refer to [JSON Indexing](./json-indexing) and [JSON Shredding](./json-shredding).

        - **New reranking functions** — **Boost Ranker** and **Decay Ranker** refine search results by combining semantic similarity with contextual relevance. For details, refer to [Boost Ranker](./boost-ranker) and [Decay Ranker](./decay-ranker).

        - **INT8 vector support** — Store quantized vectors for lightweight deep learning inference. For details, refer to [Dense Vector](./use-dense-vector).

        - **MINHASH_LSH index** — Perform efficient large-scale deduplication and similarity checks powered by MinHash and Locality-Sensitive Hashing. This feature is available in **Private Preview**, and you [can contact us](https://support.zilliz.com/hc/en-us) if you are interested. For details, refer to [MINHASH_LSH](./minhash-lsh).

        - **Partial upserts** — Update specific fields without rewriting entire records. For details, refer to [Upsert Entities](./upsert-entities#upsert-in-merge-mode-or-public).

        To enable **Public Preview**, you can upgrade your cluster to Milvus v2.6.x on the **Cluster Overview** page in the Zilliz Cloud console by selecting **Try Preview Features**. After upgrading, Milvus v2.5.x features remain available.

        ## Tiered Storage Upgrade\{#tiered-storage-upgrade}

        Zilliz Cloud’s Tiered Storage has been upgraded to optimize performance and cost efficiency. All Extended Capacity clusters are now transitioned to the new architecture, offering the following key improvements:

        - **Smart Data Management**: Automatically moves data between Hot (memory), Warm (SSD), and Cold (object storage) tiers based on access patterns, improving both performance and cost-efficiency.

        - **Higher Cache Hit Rates**: Over 90% cache hit rates, with most queries served from faster tiers.

        - **Cost Reduction**: Compute costs are reduced by 25%, and storage costs drop by 87%, from $0.30 to $0.04 per GB per month. For a 10TB dataset, monthly storage costs drop from $3,000 to $400, while maintaining high performance.

        ## Cross-Region Backup\{#cross-region-backup}

        Zilliz Cloud now supports Cross-Region Backup for Dedicated Clusters, enhancing your disaster recovery capabilities. This feature ensures resilience against complete cloud region failures by automatically replicating backups to other regions.

        **Key Capabilities**

        - **Automated Replication:** Configure your backup policy once, and Zilliz Cloud automatically handles the ongoing replication to your chosen destination region.

        - **Geographic Redundancy:** Safeguard against regional failures by storing backup copies in a physically separate location from your original backup.

        - **Rapid Recovery:** Quickly restore data from a cross-region backup to a new cluster, minimizing downtime and significantly improving your Recovery Time Objective (RTO).

        For details, refer to [Copy To Other Regions](./backup-to-other-regions).

        ## Index Build Level\{#index-build-level}

        With Milvus 2.6.x and our next-generation quantization engine, you can fine-tune the trade-off between search accuracy (recall) and data capacity to suit your application's needs. The new Index Build Level feature in Zilliz Cloud gives you control over vector search performance, offering three levels when creating an index:

        - **Precision-first:** Maximizes search accuracy for mission-critical applications where precision is paramount.

        - **Balanced (Default):** The recommended setting for most use cases, offering an ideal blend of recall, performance, and capacity.

        - **Capacity-first:** Optimized for data density, reduces query recall, but allows you to store more vectors for the budget.

        For details, refer to [Tune Index Build Level](./tune-index-build-level).

        ## Enhancements\{#enhancements}

        - You can now use the **Analyzer GUI** to quickly configure analyzers with **language-specific templates** and **test** the results. This helps users understand how their analyzer configuration affects tokenization — and ultimately impacts full-text search results. For demonstrations, refer to [Analyzer Overview](./analyzer-overview#example-use-on-the-zilliz-cloud-console).

        - Clearer error messages and enhanced experience now help users **diagnose connection issues** and set up the source database for migration more easily.

        - When cloning a collection without data, you can now edit the schema and modify collection settings.

        ## Deprecation notice\{#deprecation-notice}

        - The Pipeline feature has been deprecated and is now offline.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-09-20**

    </div>

    <div>

        ## Support Azure North Europe (Ireland)\{#support-azure-north-europe-ireland}

    </div>

</Grid>

