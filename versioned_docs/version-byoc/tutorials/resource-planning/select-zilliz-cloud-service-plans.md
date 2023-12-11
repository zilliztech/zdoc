---
slug: /select-zilliz-cloud-service-plans
beta: FALSE
notebook: FALSE
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Select the Right Cluster Plan

Zilliz Cloud provides a range of cluster types and plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision.

## Understand cluster types{#understand-cluster-types}

At its core, Zilliz Cloud offers two fundamental types of clusters: **Serverless** and **Dedicated**.

|  Cluster Type             |  Description                                                           |  Resource Allocation                                                                               |  Best Suited For                                                                  |
| ------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
|  **Serverless**           |  Simple, fully managed vector database cluster                         |  - Dynamic provisioning<br/> <br/>  - Shared resources with other users<br/> <br/>                     |  - Vector database newcomers<br/> <br/>  - Hassle-free experience seekers<br/> <br/>  |
|  **Dedicated**<br/> <br/>   |  - Full feature set<br/> <br/>  - High availability & security<br/> <br/>  |  - Dedicated [Compute Units (CUs)](./cu-types-explained)<br/> <br/>  - Optimal performance<br/> <br/>  |  - Enterprise setups<br/> <br/>  - Strict performance & security needs<br/> <br/>     |

For more in-depth details on cluster configurations, explore the [Free Trials](./free-trials) and [Pricing Calculator](./pricing-calculator).

## Select a cluster plan{#select-a-cluster-plan}

Zilliz Cloud categorizes its offerings into four distinct plans: **Starter**, **Standard**, **Enterprise**, and **Bring Your Own Cloud (BYOC)**.

|  Feature                        |  Starter              |  Standard                                                 |  Enterprise                                                       |  Bring Your Own Cloud (BYOC) |
| ------------------------------- | --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------- |
|  **Cluster Type**               |  Serverless           |  Dedicated                                                |  Dedicated                                                        |  Dedicated                   |
|  **Pricing**                    |  Free                 |  Customizable                                             |  Customizable                                                     |  Customizable                |
|  **Cloud Provider & Region**    |  GCP Exclusive        |  AWS & GCP                                                |  AWS & GCP                                                        |  User's VPC                  |
|  **CU Size Options**<br/> <br/>   |  Single CU<br/> <br/>   |  Up to 24 CUs (Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24) |  Up to 32 CUs (Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32) |  Customizable<br/> <br/>       |
|  **Max. Collections**           |  2                    |  Customizable                                             |  Customizable                                                     |  Customizable                |
|  **Private Link**               |  Not Available        |  Available                                                |  Available                                                        |  Available                   |
|  **Cloud Backup**               |  Not Available        |  Available                                                |  Available                                                        |  Available                   |
|  **Migration**                  |  Not Available        |  Available                                                |  Available                                                        |  Available                   |

### Starter plan{#starter-plan}

- Ideal for individuals or initial testing phases.

- Supports up to two collections, maxing at 500,000, 768-dimensional vectors.

- Free serverless cluster with dynamic resource provisioning.

### Standard plan{#standard-plan}

- Designed for SMEs or operations not mission-critical, with the flexibility to choose your preferred [cloud provider and region](./cloud-providers-and-regions).

- Choice of three types of [CUs](./cu-types-explained): Cost-optimized, Capacity-optimized, and Performance-optimized.

- Supports up to 24 CUs, maxing at 30 million 768-dimensional vectors.

### Enterprise plan{#enterprise-plan}

- Crafted for crucial business operations, boasting a 99.9% SLA guarantee.

- Supports up to 256 CUs per cluster, with scalability options to thousands.

- Premium features like disaster recovery across multiple availability zones, private links, and automatic backup.

### **Bring Your Own Cloud (BYOC)**{#bring-your-own-cloud-byoc}

- Deployment within your proprietary VPC.

- Ideal for heightened security, compliance requirements, or tailored customizations.

- Available for users operating on a scale of 128 CUs or more.

Visit the [Pricing Page](https://zilliz.com/pricing) or reach out to [support@zilliz.com](mailto:support@zilliz.com) for more details.

## Plan limitations{#plan-limitations}

-  **Starter**: Limited to one cluster per user on GCP, accommodating up to two collections with basic settings.

- **Standard** & **Enterprise**: Scalability of CUs and collections is defined by the selected plan, with max capacities of 30 million and 300 million 768-dimensional vectors, respectively.

- **Bring Your Own Cloud (BYOC)**: Exclusive to users requiring 128 CUs or more, offering enhanced security and compliance features via private VPC deployment.

## Related topics{#related-topics}

- [Select the Right CU](./cu-types-explained)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card) 

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace) 

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

