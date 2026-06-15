---
title: "Integrate with Model Providers | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "Model Providers"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A model provider integration connects Zilliz Cloud to a third-party model service and makes the provider’s capabilities available to your project. | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Integrate with Model Providers

A **model provider integration** connects Zilliz Cloud to a third-party model service and makes the provider’s capabilities available to your project.

An integration:

- Stores credentials required to access a model provider

- Explores the model provider’s supported capabilities (for example, text embedding or reranking)

## When you need a model provider integration\{#when-you-need-a-model-provider-integration}

You need to create a model provider integration **only when you want to use model-based capabilities** in Zilliz Cloud:

- **Text Embedding Functions**: Convert raw text into dense vectors using external models. For details, refer to Text Embedding Functions.

- **Model-based Rankers**: Re-rank search results using external reranking models. For details, refer to Model-based Rankers.

Local features such as BM25, hybrid rankers, and rule-based rankers do **not** require a model provider integration.

## Billing considerations\{#billing-considerations}

Creating a model provider integration itself does not incur charges. However, using external model providers may result in additional costs, including:

- Charges from the model provider.

- Data transfer costs when data is sent for embedding or reranking. For details, refer to Data Transfer Cost.

Billing applies only when model-based functions or rankers are executed.

## Before you start\{#before-you-start}

Before creating a model provider integration, make sure that:

- You have **Organization Owner** or **Project Admin** permissions for the target Zilliz Cloud project. If you do not have sufficient permissions, contact your Zilliz Cloud Organization Owner.

- You have a valid **API key** for the model provider you want to integrate.

## Create a model provider integration\{#create-a-model-provider-integration}

<Supademo id="cmj9f3j6u0johf6zpk5kdyx3u" title=""  />

To create a model provider integration:

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Model Providers** section, click **+ Integration**.

1. In the dialog box that appears, configure **Basic Settings**:

    - **Model Provider**: Select the model provider to integrate with.

    - **Integration Name**: A unique name for this integration (e.g., `test`).

    - **Integration Description** *(optional)*: A description for this integration (e.g., `for model provider`).

1. Click **Next**. You'll be redirected to the **Credential Information** step:

    1. In the **API Key** field, enter the API key for your model provider access.

    1. Click **Validate Integration** to check the connection. Once its status changes to Successful, proceed to the next step.

1. Click **Add**.

</Procedures>

Once created, the integration becomes available for use by model-based functions and rankers.

## Manage integrations\{#manage-integrations}

After an integration is created, you can manage it from the **Integrations** page:

- Obtain your integration ID

    The integration ID will be required when using a text embedding function or a reranking function.

- View integration details

- Edit the integration name or description

- Remove the integration when it is no longer needed

<Admonition type="info" icon="📘" title="Notes">

If an integration is removed or becomes invalid, collections or rankers that reference it may fail during insert or search operations until the integration is updated or replaced.

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## Next steps\{#next-steps}

After creating a model provider integration, you can:

- Use it with a **Text Embedding Function** to convert text into dense vectors

- Use it with **Model-based Rankers** to re-rank search results

For detailed instructions, refer to:

- Text Embedding Functions

- Reranking Functions

