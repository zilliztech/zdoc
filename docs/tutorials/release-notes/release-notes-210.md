---
slug: /release-notes-210
beta: FALSE
notebook: FALSE
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# Release Notes v2.1.0

We are excited to announce the launch of Zilliz Cloud 2.1.0. This release includes a variety of enhancements and features. [__Learn more__](./release-notes-210).

(Release date: Aug 16th, 2023)

## Expanded Regional Support{#expanded-regional-support}

Zilliz Cloud has expanded its services to include public cloud regions in Singapore, specifically **ap-southeast-1** of AWS and **asia-southeast-1** of GCP. This expansion ensures that our users in Southeast Asia have a broader reach and better performance.

For all supported public cloud regions, refer to [Cloud Providers & Regions](./cloud-providers-and-regions).

## Enhanced Usability Features{#enhanced-usability-features}

- Migration support:

    We now offer support for seamless migration of collections from serverless instances to dedicated clusters. This provides greater flexibility in scaling and operations.

- Serverless instance management:

    The ability to drop serverless instances provides users with better control over their resource allocation.

    To provide greater flexibility in scaling and operations, we now offer support for seamlessly migrating collections from serverless instances to dedicated clusters.

For details, refer to [Manage Cluster](./undefined).

## RESTful API Enhancements{#restful-api-enhancements}

- Bulk Insert

    To streamline the data ingestion process, we have introduced a new RESTful API that is specifically designed for bulk data imports. This feature aims to significantly reduce the time and complexity of data uploads. For details, see the [__API reference__](https://docs.zilliz.com/reference/import-operations).

- Dedicated Cluster Access

    To provide users with wider control and flexibility, dedicated clusters can now be accessed and managed via RESTful API, making integrations and automation more straightforward. For details, see the [__API reference__](https://docs.zilliz.com/reference/cloud-meta).

