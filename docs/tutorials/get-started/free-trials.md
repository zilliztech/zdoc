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
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
   </tr>
   <tr>
     <td><p>Cost</p></td>
     <td><p>Free</p></td>
     <td><p>Free for a limited time</p></td>
     <td><p>Deducted from free credits</p></td>
   </tr>
   <tr>
     <td><p>Trial Duration</p></td>
     <td><p>Permanent</p></td>
     <td><p>30 days</p></td>
     <td><p>30 days</p></td>
   </tr>
   <tr>
     <td><p>Use Case</p></td>
     <td><p>Quick start</p></td>
     <td><p>Serverless applications</p></td>
     <td><p>Applications in dev</p></td>
   </tr>
   <tr>
     <td><p>Max. collections</p></td>
     <td><p>2</p></td>
     <td><p>10</p></td>
     <td><p>Self-provisioned</p></td>
   </tr>
   <tr>
     <td><p>CUs</p></td>
     <td><p>Shared</p></td>
     <td><p>Auto-scale</p></td>
     <td><p>32 CUs for self-provisioning</p></td>
   </tr>
</table>

For detailed guidelines on cluster creation, refer to our [Create Cluster](./create-cluster) section.

## Related topics{#related-topics}

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

- [Create Cluster](./create-cluster) 

