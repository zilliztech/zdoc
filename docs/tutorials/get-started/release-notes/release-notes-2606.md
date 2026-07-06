---
title: "June 2026 Release Notes | Cloud"
slug: /release-notes-2606
sidebar_label: "June, 2026"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: OZtawoDUci0CKokf9RlchvInnMf
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# June 2026 Release Notes

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-06-24**

    </div>

    <div>

        ## Enhancements\{#enhancements}

        We have upgraded our backup system to orchestrate highly customized backup cycles. You can now define backup policies using advanced scheduling options tailored to your business needs.

        - **Multi-Schedule Logic:** Configure and layer multiple independent schedules within a single policy. This allows you to combine different backup frequencies (e.g., hourly during peak times, daily off-peak) to optimize your Recovery Point Objective (RPO).

        - **Advanced Cron Scheduling:** Move beyond basic daily routines. Utilize industry-standard Cron syntax (e.g., `0 9 * * 1-5`) to define intricate backup policies, such as executing backups exclusively at month-end.

        For details, refer to [Schedule Automatic Backups](./schedule-automatic-backups).

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-06-17**

    </div>

    <div>

        ## Enhancements\{#enhancements}

        - **Restore to a specific major version** — When restoring a cluster from a backup created within the last 30 days, you can now choose which Milvus major version to restore to. For example, restore a 2.5.x backup to a new 2.5.x cluster instead of being forced to upgrade to 2.6.x — critical for disaster recovery scenarios where version consistency matters. For details, refer to [Restore from Backup Files](./restore-from-backup-files) and [Use Recycle Bin](./use-recycle-bin).

        - **Description field for clusters, projects, and API keys** — You can now add and update descriptions for your clusters and projects through both the web console and REST API. API key descriptions are currently supported through the web console only, making it easier to organize and identify resources at scale.

        - **Multi-vector search in the Console** — The Search page in the Zilliz Cloud Console now supports multi-vector search, allowing you to run hybrid searches across multiple vector fields directly from the UI.

        - **Usage view for billing metrics** — Billing now supports a Usage view, allowing you to track metered usage trends by billing category, such as Serverless vCU read/write usage.

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-06-03**

    </div>

    <div>

        ## Nullable Vector\{#nullable-vector}

        Vector fields now support the `nullable` attribute, making it possible to add a new vector field to an existing collection — a capability many customers have been waiting for. With nullable vectors, you can evolve your schema by adding vector columns after collection creation, then backfill embeddings at your own pace while the collection remains fully operational.

        <Admonition type="info" icon="📘" title="**Notes**">

        Nullable Vector requires the latest Milvus 2.6.x version on Serving Clusters. On-Demand Clusters running Milvus 3.0.x already support this feature.

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

