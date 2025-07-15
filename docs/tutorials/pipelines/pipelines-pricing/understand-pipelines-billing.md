---
title: "Pipelines Pricing | Cloud"
slug: /understand-pipelines-billing
sidebar_label: "Pipelines Pricing"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Zilliz Cloud Pipelines adopts a pay-as-you-go pricing model. More specifically, you only pay for the actual usage of the models in Ingestion and Search Pipelines. | Cloud"
type: origin
token: LQYdwnA60iGLAzkmZsdcVtLHnhh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - pricing
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database

---

import Admonition from '@theme/Admonition';


# Pipelines Pricing

Zilliz Cloud Pipelines adopts a pay-as-you-go [pricing](https://zilliz.com/pricing) model. More specifically, you only pay for the actual usage of the models in Ingestion and Search Pipelines. 

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the &#36;20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

## Pipelines pricing{#pipelines-pricing}

For detailed information on the pricing of each embedding model and reranker model, please visit [Pricing](https://zilliz.com/pricing).

Currently, Zilliz Cloud Pipelines offers free quota. This means that your initial spend of &#36;20 is complimentary. 

Additionally, there is a [cap on the total usage](./limits) of Zilliz Cloud Pipelines. Each organization can consume up to &#36;20 worth of pipeline usage per month. If you need to increase the quota limit, please [contact sales](https://zilliz.com/contact-sales) or submit a ticket at the [Zilliz Support Portal](https://support.zilliz.com/hc/en-us).

## View costs and usage{#view-costs-and-usage}

Zilliz Cloud Pipelines invoice is integrated into the Zilliz Cloud vector database billing. Therefore, to understand the Pipelines charges incurred, please click **Billing** on the top navigation bar or on the left-side panel. For more information, please refer to [View Invoice](./view-invoice).

- **View costs**

    Below is an example of a detailed breakdown of the Pipelines costs in your invoice. 

    ![pipelines-cost](/img/pipelines-cost.png)

- **View usage**

    Below is an example of the Pipelines usage.

    ![pipelines-usage](/img/pipelines-usage.png)