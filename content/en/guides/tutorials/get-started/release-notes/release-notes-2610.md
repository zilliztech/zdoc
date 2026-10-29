---
title: "October 2026 Release Notes | Cloud"
slug: /release-notes-2610
sidebar_label: "Oct, 2026"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: A4jhweVMMigHOpkwDlLcKo0SnFe
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# October 2026 Release Notes

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-10-29**

    </div>

    <div>

        ## Milvus v3.0.x Public Preview\{#milvus-v30x-public-preview}

        Milvus v3.0.x is now available in Public Preview for Dedicated clusters on Zilliz Cloud. This release brings more flexible schema changes, stronger text processing, and server-side sorting and aggregation for queries and searches. To try it, deploy or use a Dedicated cluster running Milvus v2.6.x and select **Try Preview Features** on the Cluster Overview page.

        **Search and retrieval**

        - **ORDER BY in queries and searches:** Sort query results by one or more scalar fields with `order_by`, and sort search hits or groups by fields such as price or rating with `order_by_fields`. For details, refer to [Query](./get-and-scalar-query) and [Basic Vector Search](./single-vector-search).

        - **Query aggregation:** Group query results with `group_by_fields` and compute `count`, `min`, `max`, `sum`, and `avg` for each group on the server. For details, refer to [Query](./get-and-scalar-query).

        - **Search Aggregation:** Organize ANN search candidates into buckets by scalar fields, compute metrics for each bucket, order the buckets, and return representative hits, with up to four aggregation levels in one request. A single search can now return the data behind a faceted results page. For details, refer to [Search Aggregation](./search-aggregation).

        - **Regular expression filtering:** Filter `VARCHAR` fields, JSON string paths, and array elements accessed by index (for example, `tags[0]`) with the `=~` and `!~` operators using RE2 syntax, in queries, searches, and hybrid searches. For details, refer to [Pattern Matching](./pattern-match).

        - **Membership Match filtering:** Filter entities by whether a scalar field value belongs to a set you supply, sent as one compact binary blob through an expression template instead of a large `IN [...]` list. Use `type=roaring` for exact matching on signed integer fields, which is also allowed in `delete` expressions, or `type=bloom` for approximate matching on integer, `VARCHAR`, and JSON-path fields where occasional false positives are acceptable. Build the blob once with a gRPC SDK and reuse it across requests; the RESTful API cannot carry the binary blob. For details, refer to [Membership Match](/docs/membership-match).

        - **MinHash Function:** Send raw text and let Zilliz Cloud generate MinHash signatures on the server, then search them with the `MINHASH_LSH` index for near-duplicate detection and large-scale deduplication without an external model. For details, refer to [MinHash Function](./minhash-function).

        **Text and NLP**

        - **`TEXT` data type:** Store passages, long documents, tickets, and logs that exceed the 65,535-byte limit of `VARCHAR`, without setting `max_length`. Return the text through `output_fields`, or use it as the input of a BM25 Function for full-text search. For details, refer to [Text Field](./use-text-field).

        **Flexible schema and data types**

        - **Add a Function and its field to an existing collection:** Attach a BM25 or MinHash Function that reads an existing `VARCHAR` field to an existing collection, together with its generated vector field and index in one schema change, so you can turn on full-text search or deduplication without recreating the collection. For details, refer to [Alter Collection Schema](./add-fields-to-an-existing-collection).

        - **Drop fields and Functions:** Drop scalar fields, vector fields, and whole StructArray fields you no longer need, or drop a Function together with its generated field. A collection must keep at least one vector field. For details, refer to [Alter Collection Schema](./add-fields-to-an-existing-collection).

        **Nested data structure**

        - **StructArray element-level search:** Search a vector sub-field of a StructArray with a regular query vector and get element-level hits with the matching element's offset. Element-level search also supports range search, grouping search, and hybrid search. Sub-fields now also accept `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR`, and `BINARY_VECTOR`. For details, refer to [StructArray Overview](./use-array-of-structs).

        - **StructArray match filters:** Use `element_filter` to apply several conditions to the same Struct element, and the `MATCH_ANY`, `MATCH_ALL`, `MATCH_LEAST`, `MATCH_MOST`, and `MATCH_EXACT` operators to filter entities by how many elements match. For details, refer to [StructArray Operators](./struct-array-filtering).

        **Data operations**

        - **Entity-level TTL:** Expire individual entities by pointing the `ttl_field` collection property at a `TIMESTAMPTZ` field. Entities whose TTL value is `NULL` never expire, and you can extend an entity's lifetime by upserting a later timestamp. For details, refer to [Set Collection TTL](./set-collection-ttl).

        <Admonition type="info" title="Notes">

        **Dedicated clusters upgrade from the console.** Deploy a Dedicated cluster running Milvus v2.6.x, then select **Try Preview Features** on the Cluster Overview page to upgrade it to Milvus v3.0.x.
        
        **Milvus v2.5.x clusters upgrade to v2.6.x first.** There is no direct upgrade path from v2.5.x to v3.0.x.
        
        **No downtime and no index rebuild.** Clusters keep serving requests during the upgrade, though you may see a brief jitter while nodes restart. Existing indexes and analyzer settings carry over unchanged, and Milvus v2.6.x features remain available after the upgrade.
        
        **Global Clusters are not included.** Global Clusters remain on Milvus v2.6.x.

        </Admonition>

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-10-19**

    </div>

    <div>

        ## Zero Downtime Migration | ON REQUEST\{#zero-downtime-migration}

        Migrate all or selected collections in a database to an existing Dedicated cluster in the same organization while the source cluster stays available.

        - **Flexible sources:** The source can be a Dedicated, Serverless, or Free cluster, in the same project or in another project of the same organization.

        - **Existing and incremental data:** Zilliz Cloud first copies the existing data, then keeps syncing inserts, upserts, and deletes for up to 7 days.

        - **Controlled cutover:** When the sync lag drops below 10 seconds, stop writes to the source, stop the sync, and switch your application to the target cluster.

        - **Version requirement:** Both clusters must run the latest Milvus v2.6.x versions.

        This feature is available on request. To enable it, [contact us](https://support.zilliz.com/hc/en-us). For details, refer to [Zero Downtime Migration](./zero-downtime-migration).

        ## Data Backfill | ON REQUEST\{#data-backfill}

        Update selected fields of existing entities at scale from Parquet files in a Zilliz Cloud volume, for example to populate a newly added field or fill in missing values.

        - **Primary-key matching:** A backfill job matches input records to entities by primary key and never inserts new entities.

        - **Three backfill modes:** Choose `coalesce` (the default) to fill only NULL values, `overwrite` to replace the values of matched entities, or `replace` to also set the fields of unmatched entities to NULL.

        - **Precheck:** You can run a precheck first to validate the input without changing the collection.

        - **Spark batch job:** Data Backfill runs as a Spark batch job through the RESTful API and is available in all applicable AWS regions.

        This feature is available on request. To enable it, [contact us](https://support.zilliz.com/hc/en-us). For details, refer to [Data Backfill](./data-backfill).

        ## CMEK is supported with Google Cloud clusters\{#cmek-is-supported-with-google-cloud-clusters}

        - `Business Critical` projects on Google Cloud can now add a Google Cloud KMS key as a **customer-managed encryption key (CMEK)** and select it when creating a Dedicated cluster or restoring from an encrypted backup in the same region.

        For details, refer to [Google Cloud KMS](./gcp-kms).

        ## More regions for BYOC\{#more-regions-for-byoc}

        - BYOC projects can now be deployed in two more regions: Google Cloud europe-west9 (Paris, France) and AWS ap-southeast-7 (Thailand).

        For details, refer to [Cloud Providers & Regions](./cloud-providers-and-regions).

        ## Enhancements\{#enhancements}

        - **Choose whether Organization Owners are exempt from SSO enforcement** — When you enforce SSO, the **Enable SSO Enforcement** dialog now lets you decide whether Organization Owners may still log in without SSO. Owner exemption stays on by default, so organizations that already enforce SSO see no change. Turn off **Allow Organization Owners to log in without SSO** to require SSO for every member, including Organization Owners. For details, refer to [Enforce SSO in Your Organization](./enforce-sso-in-your-organization).

        - **Ping Identity (with PingOne platform) using SAML 2.0 for SSO** — The **Configure Single Sign-On (SSO)** dialog now offers a dedicated **Ping Identity (SAML 2.0)** option, with a step-by-step guide for setting up SSO with PingOne. For details, refer to [PingOne (SAML 2.0)](./single-sign-on-with-ping-one).

        - **Keep-warm schedules for On-Demand Clusters** — Set weekly time windows in which an On-Demand Cluster stays running. When a window starts, Zilliz Cloud resumes the cluster if it is suspended and pauses auto-suspend until the window ends, after which the usual auto-suspend setting applies again. A schedule holds up to 10 rules in your organization's system time zone, and you can manage it in the console or through the `keepWarm` object of the On-Demand Cluster APIs. For details, refer to [Manage On-Demand Cluster](./manage-on-demand-clusters).

        - **Skip index creation when migrating from Milvus** — When you migrate from Milvus via endpoint, you can now turn on **Skip Index Creation** for individual collections in **Advanced Settings** to migrate the schema and data without building indexes, then create indexes and load the collections when you are ready. For details, refer to [Migrate from Milvus to Zilliz Cloud Via Endpoint](./via-endpoint).

    </div>

</Grid>

