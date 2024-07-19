---
slug: /release-notes-260
beta: FALSE
notebook: FALSE
type: origin
token: NmolwVTkCiQ2yZkXsJhcftyTnhc
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes

---

import Admonition from '@theme/Admonition';


# Release Notes (Mar 13, 2024)

Zilliz Cloud has introduced two major enhancements in its latest release. Firstly, Pipelines now support six state-of-the-art (SOTA) embedding models, which expands your data processing capabilities. The other major enhancement is that the Collection Playground feature has been added to simplify your onboarding experience. With this feature, you can easily perform basic Create, Run, Update, and Delete (CRUD) operations directly from the Zilliz Cloud console, making your data interaction processes more streamlined. You can try these new features today to enjoy a more efficient and effective workflow.

## Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.3.x**.

## More Embedding Models{#more-embedding-models}

Zilliz Cloud Pipeline now supports six SOTA embedding models to broaden your data processing capabilities.

- **openai/text-embedding-3-small**

    Hosted by OpenAI. This highly efficient embedding model has stronger performance over its predecessor text-embedding-ada-002 and balances inference cost and quality.

- **openai/text-embedding-3-large**

    Hosted by OpenAI. This is OpenAI's best performing model. Compared to **text-embedding-ada-002**, the MTEB score has increased from 61.0% to 64.6%.

- **voyageai/voyage-2**

    Hosted by Voyage AI. This general purpose model excels in retrieving technical documentation containing descriptive text and code. Its more efficient version voyage-lite-02-instruct ranks top on MTEB leaderboard.

- **voyageai/voyage-code-2**

    Hosted by Voyage AI. This model is optimized for programming code, providing outstanding quality for retrieval code blocks.

- **voyageai/voyage-large-2**

    Hosted by Voyage AI. This is the most powerful generalist embedding model from Voyage AI. It supports 16k context length (4x that of voyage-2) and excels on various types of text including technical and long-context documents. This model is only available when the language is ENGLISH.

- **zilliz/bge-base-en-v1.5**

    Released by BAAI, this SOTA open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model.

## Collection Playground{#collection-playground}

In this release, Zilliz Cloud introduced the Collection Playground in Zilliz Cloud, designed to streamline your onboarding experience. The Playground allows users to seamlessly perform basic CRUD operations directly from the Zilliz Cloud console, including the insert, upsert, search, query, get, and delete operations. To access this new feature, navigate to the Playground tab in your collection on the Zilliz Cloud console. You are invited to explore this enhancement and enjoy simplified interaction with your collections!