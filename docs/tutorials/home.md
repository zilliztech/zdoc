---
title: "Home | Cloud"
slug: /home
sidebar_label: "Home"
beta: FALSE
notebook: FALSE
description: "This is the home page for the Zilliz Cloud Developer Hub. | Cloud"
type: origin
token: KXgEwDH8yifWxukkXXFctMdLnpg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - get started
  - developer hub
  - home page
  - home
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation

hide_title: true
hide_table_of_contents: true
---

import Admonition from '@theme/Admonition';



import Hero from '@site/src/components/Hero';


import Bars from '@site/src/components/Bars';


import Blocks from '@site/src/components/Blocks';


import Cards from '@site/src/components/Cards';


import Stories from '@site/src/components/Stories';


import Banner from '@site/src/components/Banner';



<Hero>

# Welcome to Zilliz Cloud Docs!{#welcome-to-zilliz-cloud-docs}

Zilliz Cloud provides a fully managed Milvus service, simplifying the deployment and scaling of vector search applications with security in mind, eliminating the need to construct and maintain complex infrastructure. [Learn more](./get-started).

![H1i9wA7f9huNQDbDat4cf813nig](/img/H1i9wA7f9huNQDbDat4cf813nig.png)

</Hero>

<Bars>

You can create clusters in the following plans:

- [Free](./create-cluster#set-up-a-free-cluster)

- [Serverless](./create-cluster#set-up-a-serverless-cluster)

- [Dedicated](./create-cluster#create-a-dedicated-cluster)

- [BYOC](/docs/byoc/byoc-intro)

[Not sure what's the right plan for you?](./select-zilliz-cloud-service-plans)

</Bars>

<Stories>

# Work with Your Data in Zilliz Cloud{#work-with-your-data-in-zilliz-cloud}

## Bring Your Own Vectors{#bring-your-own-vectors}

1. Create and connect to your cluster.

    [Create a cluster](./create-cluster) with your desired compute and storage resources and then [connect](./connect-to-cluster) to it.

1. Create a collection.

    A collection is a two-dimensional table with fixed columns and variable rows. [Create a collection](./manage-collections-sdks) to work with your data.

1. Import data.

    [Import data](./data-import) from a local file or an object storage bucket.

1. Conduct a vector similarity search.

    A [basic vector similarity search](./single-vector-search) helps you find the most similar results.

## Migrate From Other Data Infra{#migrate-from-other-data-infra}

1. Connect to your data source.

    Zilliz Cloud supports various data sources, including Pinecone, MongoDB, Qdrant, PostgreSQL, etc. See [Migration ](./migrations)[g](./migrations)[uides](./migrations).

1. Configure the migration source and target.

    Review the data source information and configure your migration target.

1. Review mappings.

    Set and review the mappings between the schema of the source and target data.

## Backup & Restore{#backup-and-restore}

1. Create a backup for your cluster or collection.

    Backups are point-of-time copies of a cluster or collection. You can create backups [manually](./create-snapshot) or [automatically](./schedule-automatic-backups).

1. (Optional) Export backups to object storage services.

    You can [export the backup files](./export-backup-files) you have created to AWS S3 or Azure Blob Storage.

1. Restore data.

    [Restore your data](./restore-from-snapshot) in the event of unexpected system failure or data loss.

</Stories>

<Cards>

# Go Further with Zilliz Cloud{#go-further-with-zilliz-cloud}

- [Monitoring & Alerts](./metrics-and-alerts)

    Monitor your clusters and get alerts on time.

- [Access Control](./access-control)

    Secure your data with fine-grained access control.

- [Private Networking](./setup-a-private-link)

    Connect your clusters to your private network.

- break

- [Billing](./payment-billing)

    Pay only for what you use, with no upfront costs.

- [Integrations](./integrate-with-third-parties)

    Integrate with your existing tools and workflows.

</Cards>

<Blocks>

# Start Building with Your Preferred Language{#start-building-with-your-preferred-language}

- [Python](/reference/python)

- [Java](/reference/java)

- [Go](/reference/go)

- [Node.js](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>

<Banner bannerText="Can't find what you're looking for?" bannerLinkText="Try Ask AI" />

