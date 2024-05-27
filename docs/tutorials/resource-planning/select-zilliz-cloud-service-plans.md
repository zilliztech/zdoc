---
slug: /select-zilliz-cloud-service-plans
sidebar_label: Cluster Plans
beta: FALSE
notebook: FALSE
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 3

---

import Admonition from '@theme/Admonition';


# Select the Right Cluster Plan

Zilliz Cloud provides a range of cluster plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision. 

## Select a cluster plan{#select-a-cluster-plan}

Zilliz Cloud categorizes its offerings into five distinct plans: **Free**, **Serverless**, **Dedicated-Standard**, **Dedicated-Enterprise**, and **Bring Your Own Cloud (BYOC)**.

<table>
   <tr>
     <th>Feature</th>
     <th>Starter</th>
     <th>Serverless</th>
     <th>Dedicated-Standard</th>
     <th>Dedicated-Enterprise</th>
     <th>Bring Your Own Cloud (BYOC)</th>
   </tr>
   <tr>
     <td><strong>Pricing</strong></td>
     <td>Free</td>
     <td>Customizable (Free for a limited time)</td>
     <td>Customizable</td>
     <td>Customizable</td>
     <td>Customizable</td>
   </tr>
   <tr>
     <td><strong>Cloud Provider & Region</strong></td>
     <td>GCP Exclusive</td>
     <td>GCP Exclusive</td>
     <td>AWS, GCP, Azure</td>
     <td>AWS, GCP, Azure</td>
     <td>User's VPC</td>
   </tr>
   <tr>
     <td><strong>CU Size Options</strong><br/></td>
     <td>Single CU<br/></td>
     <td>Auto-scale</td>
     <td></td>
     <td></td>
     <td>Customizable<br/></td>
   </tr>
   <tr>
     <td><strong>Max. Collections</strong></td>
     <td>2</td>
     <td>10 per cluster</td>
     <td>Customizable</td>
     <td>Customizable</td>
     <td>Customizable</td>
   </tr>
   <tr>
     <td><strong>Private Link</strong></td>
     <td>Not Available</td>
     <td>Not Available</td>
     <td>Not Available</td>
     <td>Available</td>
     <td>Available</td>
   </tr>
   <tr>
     <td><strong>Cloud Backup</strong></td>
     <td>Not Available</td>
     <td>Available</td>
     <td>Available</td>
     <td>Available</td>
     <td>Available</td>
   </tr>
   <tr>
     <td><strong>Migration</strong></td>
     <td>Not Available</td>
     <td>Available</td>
     <td>Available</td>
     <td>Available</td>
     <td>Available</td>
   </tr>
</table>

### Free plan{#free-plan}

- Ideal for learning, experimenting, and prototype; easy migration to plans for production.

- Supports up to two collections, each maxing at 0.5 million 768-dimensional vectors.

- Free cluster with dynamic resource provisioning.

### Serverless plan{#serverless-plan}

- Designed for serverless applications with variable or sporadic query volumes. Minimal configuration available.

- Auto-scale to meet your workload.

- Supports up to 10 collections per cluster.

### Dedicated (Standard) plan{#dedicated-standard-plan}

- Suitable for applications in dev with customizable workload management. Advanced configuration options.

- Choice of two types of [CUs](./cu-types-explained): Capacity-optimized and Performance-optimized.

- Supports up to 32 CUs.

### Dedicated (Enterprise) plan{#dedicated-enterprise-plan}

- Ideal for production applications with customizable workload management. Provides  more security controls, monitors and support SLAs.

- Choice of two types of [CUs](./cu-types-explained): Capacity-optimized and Performance-optimized.

- Supports up to 256 CUs per cluster, with scalability options to thousands.

- Premium features like disaster recovery across multiple availability zones, private links, and automatic backup.

### **Bring Your Own Cloud (BYOC)**{#bring-your-own-cloud-byoc}

- Deployment within your proprietary VPC.

- Ideal for heightened security, compliance requirements, or tailored customizations.

- Available for users operating on a scale of 128 CUs or more.

Visit the [Pricing Page](https://zilliz.com/pricing) or reach out to [support@zilliz.com](mailto:support@zilliz.com) for more details.

## Plan limitations{#plan-limitations}

- **Free**: Limited to one cluster per user on GCP, accommodating up to two collections with basic settings.

- **Serverless**: Each cluster can accommodate up to 10 collections.

- **Dedicated-Standard** & **Dedicated-Enterprise**: Scalability of CUs and collections is defined by the selected plan.

- **Bring Your Own Cloud (BYOC)**: Exclusive to users requiring 128 CUs or more, offering enhanced security and compliance features via private VPC deployment.

## Related topics{#related-topics}

- [Select the Right CU](./cu-types-explained)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

