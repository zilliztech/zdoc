---
slug: /cloud-providers-and-regions
beta: FALSE
notebook: FALSE
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# Cloud Providers & Regions

Zilliz Cloud is a cloud-based service that offers vector database clusters on public clouds. With our service, you can easily create and manage your own vector database clusters on the public cloud platform of your choice.

Zilliz Cloud provides clusters across various regions on Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. To request a new region, feel free to [contact us](https://zilliz.com/cloud-region-request?).

## AWS{#aws}

Zilliz Cloud supports deploying dedicated clusters on AWS.

|  __AWS Region__ |  __Location__     |  __Serverless Cluster__ |  __Dedicated Cluster (Standard)__ |  __Dedicated Cluster (Enterprise)__ |
| --------------- | ----------------- | ----------------------- | --------------------------------- | ----------------------------------- |
|  us-east-1      |  N. Virginia, USA |  No                     |  Yes                              |  Yes                                |
|  us-east-2      |  Ohio, USA        |  No                     |  Yes                              |  Yes                                |
|  us-west-2      |  Oregon, USA      |  No                     |  Yes                              |  Yes                                |
|  ap-southeast-2 |  Singapore        |  No                     |  Yes                              |  Yes                                |
|  eu-central-1   |  Frankfurt        |  No                     |  Yes                              |  Yes                                |

For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## GCP{#gcp}

Both serverless and dedicated clusters can be deployed on GCP.

|  __GCP Region__   |  __Location__       |  __Serverless Cluster__ |  __Dedicated Cluster (Standard)__ |  __Dedicated Cluster (Enterprise)__ |
| ----------------- | ------------------- | ----------------------- | --------------------------------- | ----------------------------------- |
|  us-west1         |  Oregon, USA        |  Yes                    |  Yes                              |  Yes                                |
|  gcp-us-east4     |  Virginia, USA      |  No                     |  Yes                              |  Yes                                |
|  gcp-europe-west3 |  Frankfurt, Germany |  No                     |  Yes                              |  Yes                                |
|  asia-southeast-1 |  Singapore          |  No                     |  Yes                              |  Yes                                |

For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## Microsoft Azure{#microsoft-azure}

Zilliz Cloud supports deploying dedicated clusters on Microsoft Azure.

|  __Azure Region__ |  __Location__  |  __Serverless Cluster__ |  __Dedicated Cluster (Standard)__ |  __Dedicated Cluster (Enterprise)__ |
| ----------------- | -------------- | ----------------------- | --------------------------------- | ----------------------------------- |
|  east-us          |  Virginia, USA |  No                     |  Yes                              |  Yes                                |

For more information on cluster types, see [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

Currently, all clusters running on Microsoft Azure support Beta version features, such as the [cosine metric type](./search-metrics-explained#cosine-similarity), [range search](./single-vector-search#range-search), [advanced expressions](./get-and-scalar-query#use-advanced-operators), and [upsert operations](./insert-update-delete#upsert-entities).

## Related topics{#related-topics}

- [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained)

- [Pricing Calculator](./pricing-calculator)

