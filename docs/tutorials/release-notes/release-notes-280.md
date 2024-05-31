---
slug: /release-notes-280
beta: FALSE
notebook: FALSE
type: origin
token: EL8jwqHsPikz2okhYzXcuLscnhf
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# Release Notes (May 15, 2024)

This update to Zilliz Cloud introduces the Serverless plan in BETA. It is designed for applications with variable query volumes, requiring minimal configuration and offering seamless scalability. This plan is now available on **GCP us-west1 (Oregon)** and includes a free trial during the BETA period. Additionally, new regions are supported for dedicated clusters: **Germany West Central (Frankfurt)** for Azure, and **europe-west3 (Frankfurt)** and **us-east-4 (Virginia)** for GCP. This release also introduces several enhancements to monitoring metrics, search precision control, and import jobs.

### Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.3.x**.

## Serverless Beta{#serverless-beta}

The Serverless plan is tailored for applications with variable or sporadic query volumes, offering minimal configuration and optimization burden, and seamless scalability.  It features a serverless cluster that auto-scales to meet your workload demands, ensuring ease of use and quick setup.

Serverless is now provided in **BETA** and available on **GCP us-west1 (Oregon)**. A free trial allows you to create up to one Serverless cluster without needing to add a payment method.

Refer to [Severless Plan](./free-trials#serverless-plan) to get more details.

## More Available regions{#more-available-regions}

New Azure region:  

- Germany West Central (Frankfurt)

New GCP region：

- europe-west3 (Frankfurt)

- us-east-4 (Virginia)

For all available cloud regions, refer to [Cloud Providers & Regions](./cloud-providers-and-regions).

## Pipelines{#pipelines}

- Text pipelines

    In addition to ingesting documents as a whole, it now supports ingesting text strings such as product description or document chunks for search. This gives more flexibility in developing RAG or semantic search. For details, please refer to [Text Data](./pipelines-text-data) and [Doc Data](./pipelines-doc-data).

- Image pipelines

    To unlock image search use cases, the newly added image pipelines can generate vector embeddings and take image URLs as query input. This allows for the implementation of applications that need to search image by image. For details, please refer to [Image Data](./pipelines-image-data).

- Now pipelines can be used with existing collections. In the REST API, the create pipeline request can specify an existing vector collection as destination, as long as the pipeline's logic matches the schema of the existing collection (e.g. if pipelines specifies PRESERVE a field called "publish_date" that field must also exist in the collection schema. For details, refer to the [pipeline reference](/reference/restful/pipeline-operations) docs.

## Enhancements{#enhancements}

This release also includes a series of enhancements:

- More [metrics](./metrics-alerts-reference) for monitoring your clusters.

- Search parameter for precision control, providing five levels for the trade-off between recall and search performance. Read [about the level parameter](./autoindex-explained#about-the-level-parameter) for more details.

- Allows for up to 10 running or pending import jobs for a single collection.

