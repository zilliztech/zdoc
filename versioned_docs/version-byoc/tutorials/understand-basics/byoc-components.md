---
slug: /byoc-components
beta: FALSE
notebook: FALSE
type: origin
token: RK4EwHdo7iu3RAk2pmOcnpRSnob
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - byoc
  - components
  - milvus

---

import Admonition from '@theme/Admonition';


# BYOC Components

This topic introduces the set of system components you need to understand in order to utilize the Zilliz Cloud Bring Your Own Cloud (BYOC) solution effectively.

## Proxy: Your gateway to Zilliz Cloud{#proxy-your-gateway-to-zilliz-cloud}

The **Proxy** serves as the access layer of Zilliz Cloud, acting as the primary endpoint for client interactions. It's a stateless component that performs crucial functions such as:

- Validating client requests.

- Reducing result sets for efficiency.

- Aggregating and post-processing results in Zilliz Cloud's Massively Parallel Processing (MPP) architecture.

- Providing a unified service address through load balancers like Nginx and Kubernetes Ingress.

## Coordinator: The brain of the operation{#coordinator-the-brain-of-the-operation}

The **Coordinator** is akin to the central nervous system of Zilliz Cloud, orchestrating various tasks across worker nodes. It's divided into four types, each with a specific role:

- **Query Coordinator** (Query Coord): Handles query node topology, load balancing, and segment transitions.

- **Data Coordinator** (Data Coord): Oversees data node topology, metadata maintenance, and triggers background data operations.

- **Index Coordinator** (Index Coord): Manages index node topology, index building, and index metadata.

### Query node: The data retriever{#query-node-the-data-retriever}

The **Query Node** is crucial for handling incremental log data. It transforms these logs into growing segments and executes hybrid searches combining vector and scalar data.

### Data node: The data processor{#data-node-the-data-processor}

The **Data Node** processes mutation requests and converts log data into snapshots for storage in object storage, ensuring efficient data handling.

### Index node: The index builder{#index-node-the-index-builder}

The **Index Node** specializes in building indexes. It's a flexible component that can operate in a non-memory resident mode, suitable for serverless frameworks.