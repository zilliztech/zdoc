---
slug: /free-trials
beta: FALSE
notebook: FALSE
type: origin
token: LMfdwRwKIiJtywkwbHVcGnOFnRf
sidebar_position: 4

---

import Admonition from '@theme/Admonition';


# Free Trials

Zilliz Cloud offers four subscription plans: **Free**, **Serverless**, **Dedicated (Standard)**, and **Dedicated (Enterprise)**. 

## Free plan{#free-plan}

This plan is ideal for learning, experimenting, and prototyping.

- **Features**

    A cluster on GCP.

- **Cost**

    Free. No credit card required.

- **Configuration**

    Minimal setup required.

- **Free Trial**

    Yes. You can create up to two collections, with each holding roughly 0.5 million 768-dimensional vectors.

- **Recommended user cases**

    Opt for this if you're new to vector databases or aiming to quickly develop a prototype.

## Serverless plan{#serverless-plan}

This plan is designed for serverless applications with variable or sporadic query volumes.

- **Features**

    A serverless cluster on GCP that auto-scales to meet your workload.

- **Cost**

    Charged based on the read and write workload you run, with a starting bonus of $100 free credits for new users.

- **Configuration**

    Minimal configuration available.

- **Free Trial**

    Yes. You can create up to 1 Serverless cluster without adding a payment method.

- **Recommended user cases**

    Opt for this if you're aiming to develop a serverless application while saving costs. 

## Dedicated (Standard) plan{#dedicated-standard-plan}

This plan is tailored for applications in dev with customizable workload management. 

- **Features**

    A dedicated cluster on AWS, GCP, and Azure. Ideal for building applications in dev environment.

- **Cost**

    Charged based on usage, with a starting bonus of $100 free credits for new users.

- **Free Trial**

    Yes. A 30-day trial is provided. If you associate a [Marketplace](./payment-billing#payment-options) account with Zilliz Cloud, you'll receive an additional $100 in free credits. Moreover, adding a payment method extends the validity of these credits to a year.

- **Recommended use cases**

    Suitable for applications in dev. If the provided 32 CUs aren't adequate, [reach out to us](https://zilliz.com/contact-sales) for a larger cluster or more credits.

## Dedicated (Enterprise) plan{#dedicated-enterprise-plan}

This plan is crafted for production applications with customizable workload management, enhanced features, robust security, and round-the-clock support.

- **Features**

    Advanced functionalities with 24/7/365 support.

- **Availability**

    On AWS, GCP, and Azure.

- **Cost**

    Check our [pricing page](https://zilliz.com/pricing).

- **Free Trial**

    No. 

- **Recommended use cases**

    Ideal for production applications that require more security controls, monitors and support SLAs. If the provided 256 CUs aren't adequate, [reach out to us](https://zilliz.com/contact-sales) for a larger cluster or more credits.

## Free trial comparison{#free-trial-comparison}

<table>
   <tr>
     <th><strong>Item</strong></th>
     <th><strong>Free</strong></th>
     <th><strong>Serverless</strong></th>
     <th><strong>Dedicated (Standard)</strong></th>
   </tr>
   <tr>
     <td>Cost</td>
     <td>Free</td>
     <td>Free for a limited time</td>
     <td>Deducted from free credits</td>
   </tr>
   <tr>
     <td>Trial Duration</td>
     <td>Permanent</td>
     <td>30 days</td>
     <td>30 days</td>
   </tr>
   <tr>
     <td>Use Case</td>
     <td>Quick start</td>
     <td>Serverless applications</td>
     <td>Applications in dev</td>
   </tr>
   <tr>
     <td>Max. collections</td>
     <td>2</td>
     <td>10</td>
     <td>Self-provisioned</td>
   </tr>
   <tr>
     <td>CUs</td>
     <td>Shared</td>
     <td>Auto-scale</td>
     <td>24 CUs for self-provisioning</td>
   </tr>
</table>

For detailed guidelines on cluster creation, refer to our [Create Cluster](./create-cluster) section.

## Related topics{#related-topics}

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

- [Create Cluster](./create-cluster) 

