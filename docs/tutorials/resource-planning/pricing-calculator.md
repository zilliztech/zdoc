---
title: "Pricing Calculator | Cloud"
slug: /pricing-calculator
sidebar_label: "Pricing Calculator"
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud Pricing Calculator is an advanced tool to help you budget effectively and make informed choices for your data storage and processing needs. This guide will walk you through using the calculator to get accurate cost estimates. | Cloud"
type: origin
token: N985w1llIi7z1SkhTH5cAoKcnKb
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - pricing
  - calculator

---

import Admonition from '@theme/Admonition';


# Pricing Calculator

The [Zilliz Cloud Pricing Calculator](https://zilliz.com/pricing#estimate_your_cost) is an advanced tool to help you budget effectively and make informed choices for your data storage and processing needs. This guide will walk you through using the calculator to get accurate cost estimates.

## Data components{#data-components}

### Number of entities{#number-of-entities}

- **Definition**: Entities are data objects stored and processed in Zilliz Cloud.

- **Adjustment Range**: From 0 to 10 billion entities.

- **Measurement**: Storage is metered in blocks of 1 million for accuracy and efficient management.

### Vector dimension{#vector-dimension}

- **Functionality**: Indicates the number of elements in your vector data.

- **Adjustment Range**: From 32 to 32,768 dimensions.

### Scalar fields{#scalar-fields}

- **Functionality**: Adds scalar fields of your data for a more precise pricing estimate.

- **Details**: Choose data types for the primary key and other fields.

### Read per Month{#read-per-month}

- **Definition**: The volume of data involved in read operations per month. Read operations include search and query.

- **Adjustment Range**: From 0 to 10 billion entities.

### Write per Month{#write-per-month}

- **Definition**: The volume of data involved in write operations per month. Write operations include insert, upsert, bulk insert, and delete.

- **Adjustment Range**: From 0 to 10 billion entities.

## Pricing variables{#pricing-variables}

### Pricing plan{#pricing-plan}

- **Serverless**: Designed for serverless applications with variable or sporadic query volumes.

- **Dedicated-Standard Plan**: Ideal for POC and development environment.

- **Dedicated-Enterprise Plan**: Ideal for mission-critical use cases in production that needs advanced capabilities, high availability, security, and continuous support.

Explore further details under [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

### CU type{#cu-type}

- **Performance-optimized CU**: High throughput and low latency for performance-critical scenarios.

- **Capacity-optimized CU**: Ideal for large data volumes, with five times the storage capacity of performance-optimized CUs.

Explore further details under [Select the Right CU](./cu-types-explained).

### Cloud provider{#cloud-provider}

- **Options**: Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure.

### Cloud region{#cloud-region}

- **Options**: Choose from a range of cloud regions based on your provider, addressing different geographic and infrastructural needs.

Explore further details under [Cloud Providers & Regions](./cloud-providers-and-regions).

## Pricing Unit{#pricing-unit}

Serverless plan clusters are charged by the number of vCUs consumed. vCU stands for virtual compute unit, and is used to measure the resources consumed by read operations (such as search and query) and write operations (such as insert, upsert, bulk insert, and delete). The data volume written or read will be converted from GB to vCUs.  

Dedicated plan clusters are charged by the number of CUs consumed. A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service. 

For more information, refer to [Understand Cost](./understand-cost#serverless-clusters).

## Considerations{#considerations}

For dedicated plans, when the estimated CU size is less than 8, the increment increase of CU size is 2 CUs, which means the CU sizes will increase in the sequence of 1, 2, 4, 6, 8 CUs. When the estimated CU size is greater than 8, the increment increase becomes 4 CUs, meaning the sequence of CU sizes will be 8, 12, 16, 20, 24, 28, 32, and so on.

Our calculator is designed to estimate costs for clusters up to 256 [CUs](./cu-types-explained). If your needs surpass this, feel free to [contact us](https://zilliz.com/contact-sales) for a tailored pricing breakdown.

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained)

- [Cloud Providers & Regions](./cloud-providers-and-regions)

