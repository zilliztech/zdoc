---
slug: /pricing-calculator
beta: FALSE
notebook: FALSE
type: origin
token: N985w1llIi7z1SkhTH5cAoKcnKb
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# Pricing Calculator

The [Zilliz Cloud Pricing Calculator](https://zilliz.com/pricing#estimate_your_cost) is an advanced tool to help you budget effectively and make informed choices for your data storage and processing needs. This guide will walk you through using the calculator to get accurate cost estimates.

## Data components{#data-components}

### Number of entities{#number-of-entities}

- __Definition__: Entities are data objects stored and processed in Zilliz Cloud.

- __Adjustment Range__: From 0 to 10 billion entities.

- __Measurement__: Storage is metered in blocks of 1 million for accuracy and efficient management.

### Vector dimension{#vector-dimension}

- __Functionality__: Indicates the number of elements in your vector data.

- __Adjustment Range__: From 32 to 32,768 dimensions.

### Scalar fields{#scalar-fields}

- __Functionality__: Adds scalar fields of your data for a more precise pricing estimate.

- __Details__: Choose data types for the primary key and other fields.

## Pricing variables{#pricing-variables}

### CU type{#cu-type}

- __Performance-optimized CU__: High throughput and low latency for performance-critical scenarios.

- __Capacity-optimized CU__: Ideal for large data volumes, with five times the storage capacity of performance-optimized CUs.

- __Cost-optimized CU__: Similar capacity to capacity-optimized CUs, but more cost-effective with slightly reduced performance.

Explore further details under [Select the Right CU](./cu-types-explained).

### Cloud provider{#cloud-provider}

- __Options__: Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure.

### Cloud region{#cloud-region}

- __Options__: Choose from a range of cloud regions based on your provider, addressing different geographic and infrastructural needs.

Explore further details under [Cloud Providers & Regions](./cloud-providers-and-regions).

### Pricing plan{#pricing-plan}

- __Standard Plan__: A dedicated cluster for small to mid-sized teams handling complex workloads.

- __Enterprise Plan__: Designed for larger organizations needing advanced capabilities, high availability, security, and continuous support.

Explore further details under [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

## Considerations{#considerations}

When the estimated CU size is less than 8, the increment increase of CU size is 2CUs, which means the CU sizes will increase in the sequence of 1, 2, 4, 6, 8 CUs. When the estimated CU size is greater than 8, the increment increase becomes 4 CUs, meaning the sequence of CU sizes will be 8, 12, 16, 20, 24, 28, 32, and so on.

Our calculator is designed to estimate costs for clusters up to 256 [CUs](./cu-types-explained). If your needs surpass this, feel free to [contact us](https://zilliz.com/contact-sales) for a tailored pricing breakdown.

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained)

- [Cloud Providers & Regions](./cloud-providers-and-regions)

