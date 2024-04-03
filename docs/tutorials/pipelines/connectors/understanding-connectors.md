---
slug: /understanding-connectors
beta: FALSE
notebook: FALSE
type: origin
token: MVbkwpGmwieFyykbLTFcRSqFnJe
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Understanding Connectors

The connector is an in-built tool that makes it easy to connect various data sources to a vector database. This guide will explain what a connector is, how it works with Zilliz Cloud vector database, and the benefits of using a connector. 

## What is a connector?{#what-is-a-connector}

A connector is a tool for ingesting data to Zilliz Cloud from various data sources, including Object Storage, Kafka (coming soon) and more. Taking object storage connector as an example, a connector can monitor a diretory in object storage bucket and sync files such as PDFs and HTMLs to [Zilliz Cloud Pipelines](./understanding-pipelines), so that they can be converted to vector representation and stored in vector database for search. With ingestion and deletion pipelines, the files and their vector representation in Zilliz Cloud are kept in sync. Any addition or removal of files in the object storage will be mapped to the vector database collection.

![connector-overview](/img/connector-overview.png)

## Why use a connector?{#why-use-a-connector}

1. __Real-time Data Ingestion__

Effortlessly ingest and index data in real-time, guaranteeing that the freshest content is instantly accessible for all search inquiries.

1. __Scalable and Adaptive__

Easily scale up your data ingestion pipeline with zero DevOps hassle. The adaptive connectors seamlessly handle fluctuating traffic loads, ensuring smooth scalability.

1. __Search Index Kept in Sync With Heterogeneous Sources__

Automatically sync the addition and deletion of documents to the search index. Moreover, fuse all common types of data source (coming soon).

1. __Observability__

Gain insight into your dataflow with detailed logging, ensuring transparency and detecting any anomalies that may arise.

## How does the connector work?{#how-does-the-connector-work}

Zilliz Cloud Connector provides flexible options to customize auto scan schedules. You can easily set the desired frequency for periodic scanning of data sources. Once the schedule is established, Zilliz Cloud Connector will periodically scan your data sources and ingest data into your vector database at regular intervals. The screenshot provided demonstrates the easy process of configuring the scan schedule with just a few clicks.

![configure-connector](/img/configure-connector.png)