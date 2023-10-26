---
slug: /select-zilliz-cloud-service-plans
beta: FALSE
notebook: FALSE
sidebar_position: 1
---



# Select Cluster Plans

Zilliz Cloud provides a variety of subscription plans and cluster types, each designed to cater to different user requirements and scenarios. Choosing the right cluster plan is key to optimizing performance, scalability, and cost-efficiency according to your specific needs.

## Determine the cluster type{#determine-the-cluster-type}

Zilliz Cloud offers two types of clusters: [Serverless](./select-zilliz-cloud-service-plans#serverless-cluster) and [Dedicated](./select-zilliz-cloud-service-plans#dedicated-cluster).

### Serverless cluster{#serverless-cluster}

- Simple, fully-managed vector database clusters.

- Dynamically provisioned resources shared among users.

- Ideal for newcomers to vector databases.

### Dedicated cluster{#dedicated-cluster}

- Full feature set with high availability and security.

- Dedicated CUs for optimal performance and control.

- Often used in enterprise environments with strict performance and security requirements.

For more information on cluster configurations, see [Free Trials](./free-trials) and [Pricing Calculator](./pricing-calculator).

## Determine the cluster plan{#determine-the-cluster-plan}

Zilliz Cloud provides four distinct cluster plans: [Starter](./select-zilliz-cloud-service-plans#starter), [Standard](./select-zilliz-cloud-service-plans#standard), [Enterprise](./select-zilliz-cloud-service-plans#enterprise), and [Self-hosted](./select-zilliz-cloud-service-plans#self-hosted).

|  Feature                    |  Starter              |  Standard                                                 |  Enterprise                                                       |  Self-Hosted          |
| --------------------------- | --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- |
|  Cluster Type               |  Serverless           |  Dedicated                                                |  Dedicated                                                        |  Dedicated            |
|  Pricing                    |  Free                 |  On Demand                                                |  On Demand                                                        |  On Demand            |
|  Cloud Provider & Region    |  GCP Only             |  AWS & GCP                                                |  AWS & GCP                                                        |  User's VPC           |
|  CU Size Options<br/> <br/>   |  Single CU<br/> <br/>   |  Up to 24 CUs (Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24) |  Up to 32 CUs (Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32) |  On Demand<br/> <br/>   |
|  Max. Collections           |  2                    |  On Demand                                                |  On Demand                                                        |  On Demand            |
|  Private Link               |  Not Supported        |  Supported                                                |  Supported                                                        |  Supported            |
|  Cloud Backup               |  Not Supported        |  Supported                                                |  Supported                                                        |  Supported            |
|  Migration                  |  Not Supported        |  Supported                                                |  Supported                                                        |  Supported            |

### Starter{#starter}

- Ideal for individuals or testing workloads, offering a user-friendly way to explore Zilliz Cloud services.

- Supports up to two collections with a max. of 500,000, 768-dimensional vectors.

- Free serverless cluster with dynamic resource provisioning.

### Standard{#standard}

- Suitable for small businesses or non-critical operations, with the flexibility to choose your preferred [cloud provider and region](./cloud-providers-and-regions).

- Access to three types of [Compute Units (CUs)](./choose-the-right-cu-type-and-size): **Cost-optimized**, **Capacity-optimized**, and **Performance-optimized**.

- Supports up to 24 CUs, handling a max. of 30 million 768-dimensional vectors.

### Enterprise{#enterprise}

- Designed for business-critical use cases, with a Service Level Agreement (SLA) guarantee of 99.9% availability.

- Supports up to 256 CUs per cluster, scalable to thousands as needed.

- Features like multi-availability zone disaster recovery, private links, and automatic backup.

### Self-hosted{#self-hosted}

- Allows deployment within your own Virtual Private Cloud (VPC).

- Suitable for high security, compliance requirements, or specific customizations.

- Offered to users with a scale of 128 CUs or more.

Visit the [Pricing Page](https://zilliz.com/pricing) or contact [support@zilliz.com](mailto:support@zilliz.com) for more details.

## Limits{#limits}

-  **Starter (Serverless)**: Limited to one per user on GCP, supporting up to two collections with basic parameter configurations.

- **Standard** & **Enterprise**: CUs and collections are scalable based on plan selection, with a maximum of 30 million and 300 million 768-dimensional vectors, respectively.

- **Self-Hosted**: Offered to users with a scale of 128 CUs or more, with the ability to deploy within their own VPC for enhanced security and compliance.

## Related topics{#related-topics}

- [Select the Right CU](./choose-the-right-cu-type-and-size)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card) 

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace) 

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)
