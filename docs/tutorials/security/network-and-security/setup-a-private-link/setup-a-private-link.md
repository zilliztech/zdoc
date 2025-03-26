---
title: "Set up a Private Endpoint | Cloud"
slug: /setup-a-private-link
sidebar_label: "Set up a Private Endpoint"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers private access to your cluster through a private link. This is useful if you do not want your cluster traffic to go over the Internet. | Cloud"
type: origin
token: O5W3wHvmbiVSoLkzKgHcvB9XnUb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - privatelink
  - private endpoint
  - aws
  - gcp
  - azure
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus

---

import Admonition from '@theme/Admonition';


# Set up a Private Endpoint

Zilliz Cloud offers private access to your cluster through a private link. This is useful if you do not want your cluster traffic to go over the Internet.

To enable private client access to clusters on Zilliz Cloud, you must create an endpoint in each of the subnets within your application's VPC. Then, register the VPC, subnets, and endpoints with Zilliz Cloud so that it can allocate a private link for you to set up a DNS record mapping the private link to the endpoints.

The following figure demonstrates how it works.

![BkbRwb8YhhqePCbZn2Kc8lWknNc](/img/BkbRwb8YhhqePCbZn2Kc8lWknNc.png)

This guide walks you through setting up a private endpoint for a cluster.

import DocCardList from '@theme/DocCardList';

<DocCardList />