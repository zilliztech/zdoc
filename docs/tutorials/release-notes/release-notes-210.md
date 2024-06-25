---
slug: /release-notes-210
beta: FALSE
notebook: FALSE
type: origin
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 10

---

import Admonition from '@theme/Admonition';


# Release Notes (Aug 16, 2023)

We are excited to announce the launch of Zilliz Cloud. This release includes a variety of enhancements and features, including expanded region support and enhanced usability features, such as migration and serverless instance management. In addition, we have enhanced the RESTful API with Bulk-insert and Dedicated Cluster support.

## Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.1.x**.

## Expanded Regional Support{#expanded-regional-support}

Zilliz Cloud has expanded its services to include public cloud regions in Singapore, specifically **ap-southeast-1** of AWS and **asia-southeast-1** of GCP. This expansion ensures that our users in Southeast Asia have a broader reach and better performance.

For all supported public cloud regions, refer to [Cloud Providers & Regions](./cloud-providers-and-regions).

## Enhanced Usability Features{#enhanced-usability-features}

- Migration support:

    We now offer support for seamless migration of collections from serverless instances to dedicated clusters. This provides greater flexibility in scaling and operations.

- Serverless instance management:

    The ability to drop serverless instances provides users with better control over their resource allocation.

    To provide greater flexibility in scaling and operations, we now offer support for seamlessly migrating collections from serverless instances to dedicated clusters.

For details, refer to [Manage Cluster](./manage-cluster).

## RESTful API Enhancements{#restful-api-enhancements}

- Bulk Insert

    To streamline the data ingestion process, we have introduced a new RESTful API that is specifically designed for bulk data imports. This feature aims to significantly reduce the time and complexity of data uploads. For details, see the [API reference](/reference/restful/import-operations).

- Dedicated Cluster Access

    To provide users with wider control and flexibility, dedicated clusters can now be accessed and managed via RESTful API, making integrations and automation more straightforward. For details, see the [API reference](/reference/restful/cloud-meta).

