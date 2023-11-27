---
slug: /docs/pricing-calculator
beta: FALSE
notebook: FALSE
sidebar_position: 4
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

## Pricing variables{#pricing-variables}

### CU type{#cu-type}

- **Performance-optimized CU**: High throughput and low latency for performance-critical scenarios.

- **Capacity-optimized CU**: Ideal for large data volumes, with five times the storage capacity of performance-optimized CUs.

- **Cost-optimized CU**: Similar capacity to capacity-optimized CUs, but more cost-effective with slightly reduced performance.

Explore further details under [Select the Right CU](./cu-types-explained).

### Cloud provider{#cloud-provider}

- **Options**: Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure.

### Cloud region{#cloud-region}

- **Options**: Choose from a range of cloud regions based on your provider, addressing different geographic and infrastructural needs.

Explore further details under [Cloud Providers & Regions](./cloud-providers-and-regions).

### Pricing plan{#pricing-plan}

- **Standard Plan**: A dedicated cluster for small to mid-sized teams handling complex workloads.

- **Enterprise Plan**: Designed for larger organizations needing advanced capabilities, high availability, security, and continuous support.

Explore further details under [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

## Considerations{#considerations}

Our calculator is designed to estimate costs for clusters up to 32 [CUs](./cu-types-explained). If your needs surpass this, feel free to [contact us](https://zilliz.com/contact-sales) for a tailored pricing breakdown.

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained)

- [Cloud Providers & Regions](./cloud-providers-and-regions)
