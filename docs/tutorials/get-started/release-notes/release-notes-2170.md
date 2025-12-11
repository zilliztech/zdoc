---
title: "Release Notes (Jun 9, 2025) | Cloud"
slug: /release-notes-2170
sidebar_label: "Release Notes (Jun 9, 2025)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This release delivers a more refined and intuitive user experience across multiple features of Zilliz Cloud. From a redesigned migration console to policy-based alerting and improved mmap controls, we've focused on making your workflows faster, more flexible, and easier to manage. New AI assistant capabilities and support for BYOC on GCP further extend the platform's power and usability, whether you're managing infrastructure, monitoring environments, or seeking support. | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance

---

import Admonition from '@theme/Admonition';


# Release Notes (Jun 9, 2025)

This release delivers a more refined and intuitive user experience across multiple features of Zilliz Cloud. From a redesigned migration console to policy-based alerting and improved mmap controls, we've focused on making your workflows faster, more flexible, and easier to manage. New AI assistant capabilities and support for BYOC on GCP further extend the platform's power and usability, whether you're managing infrastructure, monitoring environments, or seeking support.

## Milvus Compatibility\{#milvus-compatibility}

All Zilliz Cloud clusters created after this release are compatible with **Milvus v2.5.x**, and all features from Milvus v2.5.x are **Generally Available**.

## Refined user interface and best practice docs, improving the migration experience\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **New console user interface:** Quickly locate data sources and select the proper migration method with a clean, intuitive GUI.

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](https://zdoc-images.s3.us-west-2.amazonaws.com/m3k4bsnieoqbkexpdapcd6j7nvb.png "M3K4bSnIeoqBKExPdaPcd6j7nVb")

    Zilliz Cloud supports migrations between Zilliz Cloud clusters, from Milvus instances, and from several external sources. For details on the possible data sources, refer to [Migrations](./migrations).

- **Advanced collection & configuration tools:** Confidently handle complex collection and field mappings with improved data type support, dynamic-to-fixed field conversion, and intuitive controls for configuring field and shard settings — all within a responsive, user-friendly interface.

    ![O3AebUiCjonYFSxLrbucDp5SnOb](https://zdoc-images.s3.us-west-2.amazonaws.com/o3aebuicjonyfsxlrbucdp5snob.png "O3AebUiCjonYFSxLrbucDp5SnOb")

    You can read [External Migration Basics](./external-migration-basics) for guidance on general procedures for migrations from external sources, and learn about the requirements and common issues handling rules for specific external sources, including [Pinecone](./migrate-from-pinecone), [Qdrant](./migrate-from-qdrant), [Elasticsearch](./migrate-from-elasticsearch), [PostgreSQL](./migrate-from-pgvector), [Tencent Cloud](./migrate-from-tencent-cloud), and [OpenSearch](./migrate-from-opensearch).

## Policy-based alerts for granular and flexible monitoring\{#policy-based-alerts-for-granular-and-flexible-monitoring}

This alert system upgrade introduces **Alert Policies** for more granular and flexible monitoring. 

- **Policy-Based Alerts:** You can now target specific clusters for precision monitoring.

- **Clone Policies:** Save time by duplicating existing policies with just a click.

- **OpenAPI Support:** Automate alert management via programmatic access.

- **Seamless Migration:** All legacy alerts have been transitioned to the new framework without disruption.

For details on policy-based alerts, refer to [Manage Project Alerts](./manage-project-alerts) and the RESTful API reference pages on [creating](/reference/restful/create-alert-rule-v2), [updating](/reference/restful/update-alert-rule-v2), [listing](/reference/restful/list-alert-rules-v2), and [deleting](/reference/restful/delete-alert-rule-v2) alert rules.

## UI support for mmap settings\{#ui-support-for-mmap-settings}

Zilliz Cloud follows [cluster-level defaults](./use-mmap#global-mmap-strategy) based on your CU type and plan. Since this release, you can manage **mmap settings** directly from the graphical user interface (GUI) at the collection and field levels. 

- **Collection-Level Configuration:** Easily apply mmap settings to raw data if needed.

- **Field-Level Control:** Enable, disable, or remove mmap settings for raw and index data of a specific field.

![JspDbBt12o4ra2x353ycjG1Mn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/jspdbbt12o4ra2x353ycjg1mn7b.png "JspDbBt12o4ra2x353ycjG1Mn7b")

## BYOC now available on GCP\{#byoc-now-available-on-gcp}

Zilliz Cloud **Bring Your Own Cloud (BYOC)** now supports **Google Cloud Platform (GCP)**.

- **Data Plane Deployment:** Run Zilliz Cloud Data Plane in your own GCP environment for full control over data and security.

- **Flexible Setup Options:** Use our Terraform provider for IaC automation or follow a step-by-step manual guide to configure networking, auth rules, and projects.

For details, refer to [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) for the manual guides, and [Terraform Provider](/docs/byoc/terraform-provider) for IaC automation.

## Well-designed AI assistance connects you directly to Zilliz supports\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

This release has enhanced the visual design of Zilliz Cloud AI assistance for a more intuitive and pleasant user experience and introduced two new smart capabilities:

- **Escalate to Support:** Automatically detects requests for human support and routes them promptly.

- **Detect Sales Signals:** Identifies buying intent and sales-related cues for timely follow-up.

![OQTSbop2WoTH2px3o5tcbDmmnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/oqtsbop2woth2px3o5tcbdmmnyf.png "OQTSbop2WoTH2px3o5tcbDmmnYf")

## Other Improvements\{#other-improvements}

- Improved alert settings and alert history display.

- Streamlined workflows for **invitation registration** and **password recovery**.

