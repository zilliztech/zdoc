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

A connector is a tool designed to support data streaming from one place to another. As indicated in the diagram below, a connector first scans the data in various file formats hosted on different object storage services (eg. AWS S3, Google Cloud Storage, etc.) and transfer them into vector database via [Zilliz Cloud Pipelines](./understanding-pipelines). These source data will be further processed by the ingestion or deletion pipeline and finally stored as entities in a Zillliz Cloud collection.

![XF2zbQ3YOocLiXx2Tp9cvOhNnSh](/img/XF2zbQ3YOocLiXx2Tp9cvOhNnSh.png)

## How does the connector work?{#how-does-the-connector-work}

When a connector is created, Zilliz Cloud periodically checks the provided object storage path for file addition or deletion. The workflow diagram below illustrates this process.

[Unsupported block type]

![understanding-connectors](/img/understanding-connectors.png)

The connector consists of four components.

- __User__: Users can access the current token usage via the control platform.

- __Control Platform: __Offers users an API to configure connectors and pipelines. It analyzes the configurations and sends them to the scheduler to ensure timely initiation of sync tasks.

- __Resource Pool: __A self-developed task scheduler that receives and executes sync tasks.

- __Task: __Executes tasks and distinguishes between different data sources, such as HTTP and Kafka.

Please note that the connector determines file updates based on the file name.

## Why use a connector?{#why-use-a-connector}

1. __Seamless Data Ingestion__

In RAG applications, the connector's role starts with data ingestion, where it sources information from various data streams and prepares it for processing.

1. __Real-time Data Availability__

For RAG applications, which often rely on the most current data to generate responses, connectors are crucial for real-time data availability.

1. __Data Integrity and Consistency__

Connectors are responsible for maintaining the integrity and consistency of data as it moves from the original sources to the retrieval system, ensuring that the generated outputs are based on accurate and up-to-date information.

1. __Scalability and Adaptability__

Connectors help RAG systems to scale up and adapt as new data sources emerge or as existing ones evolve, without the need for substantial changes to the core system.