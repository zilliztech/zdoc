---
slug: /docs/cloud-providers-and-regions
beta: FALSE
notebook: FALSE
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# Cloud Providers & Regions

Zilliz Cloud is a cloud-based service that offers vector database clusters on public clouds. With our service, you can easily create and manage your own vector database clusters on the public cloud platform of your choice.

## Amazon Web Services (AWS){#amazon-web-services-aws}

Zilliz Cloud supports deploying dedicated clusters on Amazon Web Services (AWS).

|  **AWS Region** |  **Location**     |  **Serverless Cluster** |  **Dedicated Cluster (Standard)** |  **Dedicated Cluster (Enterprise)** |
| --------------- | ----------------- | ----------------------- | --------------------------------- | ----------------------------------- |
|  us-east-1      |  N. Virginia, USA |  No                     |  Yes                              |  Yes                                |
|  us-east-2      |  Ohio, USA        |  No                     |  Yes                              |  Yes                                |
|  us-west-2      |  Oregon, USA      |  No                     |  Yes                              |  Yes                                |
|  ap-southeast-2 |  Singapore        |  No                     |  Yes                              |  Yes                                |
|  eu-central-1   |  Frankfurt        |  No                     |  Yes                              |  Yes                                |

For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## Google Cloud Platform (GCP){#google-cloud-platform-gcp}

Both serverless and dedicated clusters can be deployed on Google Cloud Platform (GCP).

|  **GCP Region**   |  **Location** |  **Serverless Cluster** |  **Dedicated Cluster (Standard)** |  **Dedicated Cluster (Enterprise)** |
| ----------------- | ------------- | ----------------------- | --------------------------------- | ----------------------------------- |
|  us-west1         |  Oregon, USA  |  Yes                    |  Yes                              |  Yes                                |
|  asia-southeast-1 |  Singapore    |  Yes                    |  Yes                              |  Yes                                |

For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## Microsoft Azure{#microsoft-azure}

Zilliz Cloud supports deploying dedicated clusters on Microsoft Azure.

|  **Azure Region** |  **Location**  |  **Serverless Cluster** |  **Dedicated Cluster (Standard)** |  **Dedicated Cluster (Enterprise)** |
| ----------------- | -------------- | ----------------------- | --------------------------------- | ----------------------------------- |
|  east-us          |  Virginia, USA |  No                     |  Yes                              |  Yes                                |

For more information on cluster types, see [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

Currently, all clusters running on Microsoft Azure support Beta version features, such as the [cosine metric type](https://zilliverse.feishu.cn/docx/FbIPdV2BpoTuwux5N8gc4qxmncb#CTPEdZRu6oH6UXx9W48cGc8onGg), [range search](./conduct-a-range-search), [advanced expressions](./search-and-query-advanced-expressions), and [upsert operations](./upsert-entities).

## Related topics{#related-topics}

- [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained)

- [Pricing Calculator](./pricing-calculator)
