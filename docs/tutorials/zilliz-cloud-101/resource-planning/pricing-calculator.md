---
slug: /pricing-calculator
sidebar_position: 3
---



# Pricing Calculator

[Zilliz Cloud Pricing Calculator](https://zilliz.com/pricing#estimate_your_cost) helps you estimate budgets and make optimal selections. To use the calculator, you need to provide a blueprint of your data, including:

- Number of entities
    Entities are data objects stored and processed in Zilliz Cloud clusters. Using the pricing calculator, you have the flexibility to seamlessly scale the slide bar, allowing you to adjust the number of entities anywhere between 0 and a staggering 10 billion. It's worth noting that the storage of entities will be metered at a granularity of 1 million, ensuring accurate measurement and efficient management of your data.

- Vector dimensions
    Vector dimensions refer to the number of elements that define your vector data. Using the pricing calculator, you can scale vector dimensions from 32 to 32,768.

:::info Notes

Our pricing calculator is user-friendly and designed to estimate the cost of clusters with up to 32 [CUs](./cu-types-explained-1). If your requirements exceed this upper limit, please contact our dedicated customer service team. They will be happy to provide you with detailed pricing information tailored to your specific needs.

:::

With a blueprint of your dataset, you can compare the prices of different combinations in the following aspects:

- CU types
    - **Performance-optimized CU** supports high throughput and low latency, suitable for high-performance scenarios.

    - **Capacity-optimized CU** applies to scenarios with data volumes five times larger than performance-optimized scenarios, suitable for increased storage capacity.

    - **Cost-optimized CU** provides the same large capacity as the capacity-optimized scenarios, at a lower cost with compromised performance.

- Cloud providers
    Currently, Zilliz Cloud supports Amazon Web Services (AWS) and Google Cloud Platform (GCP). You can choose where to host your clusters.

- Cloud regions
    Depending on the cloud providers you choose to work with, Zilliz Cloud provides a range of cloud region options that cater to various geographic locations and infrastructural preferences across the globe.

    For AWS, available regions include **us-west-2 (Oregon)**, **us-east-2 (Ohio)**, and **ap-southeast-1 (Singapore)**. For GCP, available regions include **us-west-1 (Oregon)** and **asia-southeast1 (Singapore)**. For more information, see [Cloud Providers & Regions](./cloud-providers-and-regions).

- Plan tiers
    - **Standard**: provides a dedicated cluster for small and mid-sized teams with complex workloads. This tier works for users who need a cost-efficient solution to process large-scale data.

    - **Enterprise**: provides a dedicated cluster for at-scale organizations with advanced features, high availability and security, and 24/7/365 support.
