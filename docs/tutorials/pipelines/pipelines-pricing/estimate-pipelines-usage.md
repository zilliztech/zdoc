---
title: "Estimate Pipeline Usage | Cloud"
slug: /estimate-pipelines-usage
sidebar_label: "Estimate Pipeline Usage"
beta: FALSE
notebook: FALSE
description: "The cost of running pipelines is measured by tokens. Similar to Large Language Model (LLM) that uses token as a basic unit, pipelines process documents and search queries by parsing and embedding the text as a series of tokens. To understand the cost of a pipeline run, you can use our Estimate Pipeline Usage tool to count tokens of a file or a text string. | Cloud"
type: origin
token: LNuqwIPPai9GUYk5U4ccAQhQn1b
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - pricing
  - usage
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings

---

import Admonition from '@theme/Admonition';


# Estimate Pipeline Usage

The cost of running pipelines is measured by tokens. Similar to Large Language Model (LLM) that uses token as a basic unit, pipelines process documents and search queries by parsing and embedding the text as a series of tokens. To understand the cost of a pipeline run, you can use our Estimate Pipeline Usage tool to count tokens of a file or a text string. 

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the $20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p></li>
<li><p>This tool uses a Byte-Pair Encoding (BPE) tokenizer and the estimated usage may vary by 30% based on different processing strategy. Therefore, you should only use the estimated usage as a reference. For actual usage, please refer to the <a href="./pipelines-ingest-search-delete-data">Pipelines list</a>.</p></li>
</ul>

</Admonition>

## What are tokens?{#what-are-tokens}

Token is a special concept in NLP. It can be thought of as a sub-word. Some word is a token itself, while some longer words may contain multiple tokens. Token is also language dependent. As a rule of thumb, on average:

- 1 token is 3 to 4 English characters

- 1 token is 1.12 Chinese characters

- 1 English word contains 1.3 tokens

## How is the token processed by Pipelines?{#how-is-the-token-processed-by-pipelines}

Ingestion Pipeline processes documents by parsing files into tokens and then splitting and embedding the token series. Search Pipeline processes the query by embedding the token series. By passing the tokens to a deep learning model (called embedding model), the "essence" of the text is converted into a vector representation, which can be stored in and retrieved by a vector database. With the help of this process, Pipelines is able to help the API users to understand the meaning and semantics of different words and their context within a sentence or text.

Deletion Pipelines usually doesn't involve processing text as tokens.

## Estimate Pipelines Usage{#estimate-pipelines-usage}

To help easily understand the cost implication of any pipeline run, we offer a web UI tool that can estimate the token of a file or text string. You can use this tool to estimate cost before running a pipeline.

![estimate-piplines-usage-tool-entrance](/img/estimate-piplines-usage-tool-entrance.png)

1. Input

    - An Ingestion pipeline takes a file as input. You can directly upload a local file or use a file from object storage to estimate the usage of an Ingestion pipeline run.

        - Upload a local file

            Upload a local file of no more than 10 MB. Supported file formats include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`.

        - Import a file from object storage

            Provide the public or pre-signed URLs on [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) or [GCS](https://cloud.google.com/storage/docs/access-control/signed-urls). Enter one URL each time.

    - A Search pipeline takes a query string as input. You can directly input a text string to estimate the usage of a Search pipeline run.

        - Directly input the text for tokenization in the input box.

        <Admonition type="info" icon="📘" title="Notes">

        <p>You can only input a maximum of 100,000 characters.</p>

        </Admonition>

1. Click **Calculate**.

    ![estimate-piplines-usage](/img/estimate-piplines-usage.png)

1. Check the estimated token count of your file.

1. Click **Reset** to upload another local file.

## Related topics{#related-topics}

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](/docs/faq-pipelines)

