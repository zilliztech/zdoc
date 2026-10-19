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
sidebar_position: 40
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# October 2026 Release Notes

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

        - **Spark batch job:** Data Backfill runs as a Spark batch job through the RESTful API and is available only in AWS us-west-2 (Oregon).

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

