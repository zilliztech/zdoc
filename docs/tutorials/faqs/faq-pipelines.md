---
title: "FAQ: Pipelines | CLOUD"
slug: /faq-pipelines
sidebar_label: "FAQ: Pipelines"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues you may encounter while using pipelines. | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 5

---

# FAQ: Pipelines

This topic lists the possible issues you may encounter while using pipelines.

## Contents

- [How can Zilliz Cloud Pipelines enhance my semantic search capabilities?](#how-can-zilliz-cloud-pipelines-enhance-my-semantic-search-capabilities)
- [Which Zilliz Cloud Product Tiers are Pipelines available in?](#which-zilliz-cloud-product-tiers-are-pipelines-available-in)
- [Which embedding model does Zilliz Cloud Pipelines use?](#which-embedding-model-does-zilliz-cloud-pipelines-use)
- [How is Zilliz Cloud Pipelines charged?](#how-is-zilliz-cloud-pipelines-charged)
- [Can I use Zilliz Cloud Pipelines standalone?](#can-i-use-zilliz-cloud-pipelines-standalone)
- [What data sources are supported by Ingestion Pipelines?](#what-data-sources-are-supported-by-ingestion-pipelines)
- [What document file formats are supported by Pipelines?](#what-document-file-formats-are-supported-by-pipelines)

## FAQs




### How can Zilliz Cloud Pipelines enhance my semantic search capabilities?{#how-can-zilliz-cloud-pipelines-enhance-my-semantic-search-capabilities}

Pipelines help create high-quality vector embeddings, which serve as the foundation for relevant semantic search results.

### Which Zilliz Cloud Product Tiers are Pipelines available in?{#which-zilliz-cloud-product-tiers-are-pipelines-available-in}

Zilliz Cloud Pipeline is available on all tiers as long as you have created a cluster on GCP us-west1. 

### Which embedding model does Zilliz Cloud Pipelines use?{#which-embedding-model-does-zilliz-cloud-pipelines-use}

The text and doc ingestion and search pipelines support various embedding models.

- **For English:**

    - zilliz/bge-base-en-v1.5

        Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model.

    - voyageai/voyage-2

        Hosted by Voyage AI. This general purpose model excels in retrieving technical documentation containing descriptive text and code. Its lighter version voyage-lite-02-instruct ranks top on MTEB leaderboard.

    - voyageai/voyage-code-2

        Hosted by Voyage AI. This model is optimized for software code, providing outstanding quality for retrieving software documents and source code.

    - voyageai/voyage-large-2

        Hosted by Voyage AI. This is the most powerful generalist embedding model from Voyage AI. It supports 16k context length (4x that of voyage-2) and excels on various types of text including technical and long-context documents.

    - openai/text-embedding-3-small 

        Hosted by OpenAI. This highly efficient embedding model has stronger performance over its predecessor text-embedding-ada-002 and balances inference cost and quality.

    - openai/text-embedding-3-large

        Hosted by OpenAI. This is OpenAI's best performing model. Compared to `text-embedding-ada-002`, the MTEB score has increased from 61.0% to 64.6%.

- **For Chinese:**

    - zilliz/bge-base-zh-v1.5 

        Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model.

The image ingestion and search pipelines support the following embedding models:

- zilliz/vit-base-patch16-224

    The Vision Transformer (ViT) is a transformer encoder model (BERT-like) open-sourced by Google. The model is pretrained on a large collection of images to embed the semantic of image content to a vector space. The model is hosted on Zilliz Cloud to provide the best latency.

- zilliz/clip-vit-base-patch32

    A multi-modal model released by OpenAI. This vision model and its pairing text model are capable of embedding images and texts into the same vector space, enabling semantic search between visual and textual information. The model is hosted on Zilliz Cloud to provide the best latency.

- zilliz/clip-vit-base-patch32-multilingual-v1

    A multi-lingual variant of OpenAI's CLIP-ViT-B32 model. It is designed to work together with CLIP-ViT-B32's vision model and can process text in more than 50 languages. This model is hosted on Zilliz Cloud to provide the best latency.

### How is Zilliz Cloud Pipelines charged?{#how-is-zilliz-cloud-pipelines-charged}

Currently, Zilliz Cloud Pipelines offer free quotas. Your initial spend of &#36;20 is complimentary. For more details, please refer to [Pricing](https://zilliz.com/pricing).

### Can I use Zilliz Cloud Pipelines standalone?{#can-i-use-zilliz-cloud-pipelines-standalone}

No, you must be a Zilliz Cloud vector database customer to access the Pipelines functionalities.

### What data sources are supported by Ingestion Pipelines?{#what-data-sources-are-supported-by-ingestion-pipelines}

Currently, Ingestion Pipelines support local files and files stored on AWS S3 and Google Cloud Storage. We are actively working to expand support for additional data sources in the future.

### What document file formats are supported by Pipelines?{#what-document-file-formats-are-supported-by-pipelines}

Supported file formats include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`. When running an Ingestion pipeline, you can either upload a local file or use an S3 presigned URL or a GCS signed URL.
