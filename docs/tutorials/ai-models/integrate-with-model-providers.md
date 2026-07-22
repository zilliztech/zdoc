---
title: "Integrate with Model Providers | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "Model Providers"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A text embedding or reranking model hosted by an external provider cannot be called from Zilliz Cloud until the provider can authenticate requests from your project. A model provider integration stores the provider-issued credential at the project level and gives Zilliz Cloud an integration ID that text embedding and reranking features can reference. This avoids placing credentials in individual Function or Ranker configurations. | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Integrate with Model Providers

A text embedding or reranking model hosted by an external provider cannot be called from Zilliz Cloud until the provider can authenticate requests from your project. A **model provider integration** stores the provider-issued credential at the project level and gives Zilliz Cloud an integration ID that text embedding and reranking features can reference. This avoids placing credentials in individual Function or Ranker configurations.

<Admonition type="info" icon="📘" title="Notes">

Creating a model provider integration does not incur charges. The external provider may charge for model inference, and sending data to the provider may incur [data transfer costs](./data-transfer-cost).

Model availability, task support, stability, latency, and output quality depend on the external provider and selected model. Zilliz Cloud provides the integration and credential-handling path but does not control these properties. Before production use, verify that the provider currently serves the model for the required task and evaluate its reliability, performance, and output quality for your workload.

</Admonition>

## Supported model providers\{#supported-model-providers}

The following model providers can be integrated with Zilliz Cloud:

| Model provider | Supported Zilliz Cloud features | Required credential |
| --- | --- | --- |
| **OpenAI** | Text Embedding Function | API key. To obtain one, see the [OpenAI API quickstart](https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key). |
| **Cohere** | Text Embedding Function and model-based Ranker | API key. To obtain one, see [API Keys and Rate Limits](https://docs.cohere.com/docs/rate-limits). |
| **Voyage AI** | Text Embedding Function and model-based Ranker | API key. To obtain one, see [API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation). |
| **Hugging Face** | Text Embedding Function and Hugging Face Ranker | User Access Token with **Make calls to Inference Providers** permission. To obtain one, see [User Access Tokens](https://huggingface.co/docs/hub/en/security-tokens). |

## Before you start\{#before-you-start}

Before creating a model provider integration, make sure that:

- You have **Organization Owner** or **Project Admin** permissions for the target Zilliz Cloud project. If you do not have sufficient permissions, contact your Zilliz Cloud Organization Owner.

- You have the credential required by the selected model provider. See [Supported model providers](./integrate-with-model-providers).

## Create an integration in the Zilliz Cloud console\{#create-an-integration-in-the-zilliz-cloud-console}

<Supademo id="cmj9f3j6u0johf6zpk5kdyx3u" title=""  />

To create a model provider integration:

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Model Providers** section, click **+ Integration**.

1. In the dialog box that appears, configure **Basic Settings**:

    - **Model Provider**: Select the model provider to integrate with.

    - **Integration Name**: A unique name for this integration (e.g., `test`).

    - **Integration Description***(optional)*: A description for this integration (e.g., `for model provider`).

    - **Provider** *(Hugging Face only)*: Keep the default value, `hf-inference`. Hugging Face Text Embedding and Hugging Face Ranker currently support only this Inference Provider.

1. Click **Next**. You'll be redirected to the **Credential Information** step:

    1. Enter the credential required by the selected model provider. For Hugging Face, enter your User Access Token in the **Hugging Face Access Token** field.

    1. Click **Validate Integration** to check the connection. Once its status changes to Successful, proceed to the next step.

1. Click **Add**.

</Procedures>

Once created, the integration becomes available for use by model-based functions and rankers.

For Hugging Face, **Validate Integration** verifies that Zilliz Cloud can authenticate with the supplied User Access Token. Feature-specific compatibility is validated when you configure or execute the Function or Ranker. A Text Embedding Function requires a model served by `hf-inference` for the feature-extraction task. Hugging Face Ranker requires a model served by `hf-inference` for the sentence-similarity task. Zilliz Cloud masks the User Access Token after the integration is created.

## Manage integrations\{#manage-integrations}

After an integration is created, you can manage it from the **Integrations** page:

- Obtain your integration ID

    The integration ID is required when a Text Embedding Function or model-based Ranker uses the integration.

- View integration details

- Edit the integration name or description

- Remove the integration when it is no longer needed

<Admonition type="info" icon="📘" title="Notes">

If an integration is removed or becomes invalid, collections or rankers that reference it may fail during insert or search operations until the integration is updated or replaced.

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## Next steps\{#next-steps}

After creating a model provider integration, you can:

- Use it with a **Text Embedding Function** to convert text into dense vectors.

- Use a Cohere or Voyage AI integration with a model-based Ranker to rerank search results.

- Use a Hugging Face integration with Hugging Face Ranker to rerank search results using scores returned by the sentence-similarity task.

For detailed instructions, refer to:

- [Function Overview](./function-and-model-inference-overview)

- [OpenAI](./openai)

- [Cohere](./cohere)

- [Voyage AI](./voyage-ai)

- Hugging Face

- Hugging Face Ranker

- [Cohere Ranker](./cohere-model-ranker)

- [Voyage AI Ranker](./voyage-ai-model-ranker)

