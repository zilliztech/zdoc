---
slug: /pricing-calculator
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Pricing Calculator

Our [Zilliz Cloud Pricing Calculator](https://zilliz.com/pricing#estimate_your_cost) is here to assist you in budgeting effectively and making optimal selections. To get started, you need to share some details about your data:

- **Number of Entities**
    Entities are data objects stored and processed in Zilliz Cloud clusters. With our calculator, you can easily adjust the number of entities anywhere between 0 to an impressive 10 billion by sliding the bar. Note that entity storage is metered in blocks of 1 million for precise measurement and efficient data management.

- **Vector Dimensions**
    Vector dimensions indicate the number of elements defining your vector data. Adjust the vector dimensions between 32 to 32,768 using the calculator.

<Admonition type="info" icon="📘" title="Notes">

Our calculator is designed to estimate costs for clusters up to 32 [CUs](./cu-types-explained-1). If your needs surpass this, feel free to [contact us](https://zilliz.com/contact-sales) for a tailored pricing breakdown.

</Admonition>

Once you've outlined your dataset, you can explore price estimates for various setups considering:

- **CU Types**
    - Performance-optimized CU: Ideal for high-performance scenarios with its high throughput and low latency.

    - Capacity-optimized CU: Best for larger data volumes, offering five times the storage capacity of performance-optimized CUs.

    - Cost-optimized CU: Delivers the same large capacity as capacity-optimized CUs, but at a lower cost, albeit with reduced performance.

    Explore further details under [Select the Right CU](./cu-types-explained-1).

- **Cloud Providers**
    We support hosting on Amazon Web Services (AWS) and Google Cloud Platform (GCP).

- **Cloud Regions**
    Select from a variety of cloud region options based on your chosen cloud provider, catering to different geographic and infrastructural preferences.

    Explore further details under [Cloud Providers & Regions](./cloud-providers-and-regions).

- **Pricing Plan**
    - **Standard**: A dedicated cluster for small to mid-sized teams with complex workloads, offering a cost-efficient solution for large-scale data processing.

    - **Enterprise**: A dedicated cluster for larger organizations, featuring advanced capabilities, high availability, security, and round-the-clock support.

    Explore further details under [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained-1)

- [Cloud Providers & Regions](./cloud-providers-and-regions)
