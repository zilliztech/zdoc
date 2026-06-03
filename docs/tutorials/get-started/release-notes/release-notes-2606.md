---
title: "June 2026 Release Notes | Cloud"
slug: /release-notes-2606
sidebar_key: release-notes-2606
sidebar_label: "June, 2026"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "June 2026 Release Notes | Cloud"
type: origin
token: OZtawoDUci0CKokf9RlchvInnMf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# June 2026 Release Notes

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-06-03**

    </div>

    <div>

        ## Nullable Vector\{#nullable-vector}

        Vector fields now support the `nullable` attribute, making it possible to add a new vector field to an existing collection — a capability many customers have been waiting for. With nullable vectors, you can evolve your schema by adding vector columns after collection creation, then backfill embeddings at your own pace while the collection remains fully operational.

        <Admonition type="info" icon="📘" title="Notes">

        <p>Nullable Vector requires the latest Milvus 2.6.x version on Serving Clusters. On-Demand Clusters running Milvus 3.0.x already support this feature.</p>

        </Admonition>

        This applies to all six vector types — `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR`, `BINARY_VECTOR`, and `SPARSE_FLOAT_VECTOR`. Key highlights:

        - **Add vector fields to existing collections** — Use `AddCollectionField` to add new nullable vector columns online without rebuilding existing data. Existing entities start with NULL vectors and can be backfilled incrementally.

        - **Automatic search exclusion** — NULL vectors are automatically skipped during vector index building and search with no impact on retrieval quality.

        - **Near-zero storage** — NULL vectors consume effectively no storage, making it cost-efficient to store entities where embeddings are not yet available.

        - **Full workflow coverage** — Nullable vectors are supported across Create Collection, Add Field, Data Preview, Import, Backup & Restore, and Migration workflows.

        For details, refer to [Nullable Fields](./nullable-fields) and [Add Fields to an Existing Collection](./add-fields-to-an-existing-collection).

        ## Enhancements\{#enhancements}

        - **On-Demand Compute supports Private Endpoint** — On-Demand Compute now supports Private Endpoint for secure, private network access to your on-demand search workloads. The setup follows the same workflow as Serving Clusters. For details, refer to [Set up a PrivateLink (AWS)](./setup-a-private-link-aws).

        - **Enhanced Data Preview** — The Data Preview page now supports upsert for editing individual records in place, one-click insertion of 10, 50, or 100 sample records, and infinite paging for smoother navigation through large datasets.

        - **Collection Creation: Redesigned fields section** — A more intuitive layout for field configuration, making schema setup faster and easier. For details, refer to the Create a collection - Collection schema section in [Manage Collections (Console)](./manage-collections-console).

    </div>

</Grid>

