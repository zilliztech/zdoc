---
title: "MetricType | Java | v2"
slug: /java/java/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Java | v2"
type: docx
token: GEcrdVWnboOetOx08RrcRHVhn3g
sidebar_position: 14
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - javaV226
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

This is an enumeration that provides the following constants.

## Constants\{#constants}

- INVALID

    Sets the metric type to **INVALID**.

- L2

    Sets the metric type to **L2**. This applies to float vectors only.

- IP

    Sets the metric type to **IP**. This applies to float vectors only.

- COSINE

    Sets the metric type to **COSINE**. This applies to float vectors only.

- HAMMING

    Sets the metric type to **HAMMING**. This applies to binary vectors only.

- JACCARD

    Sets the metric type to **JACCARD**. This applies to binary vectors only.

- BM25

    Sets the metric type to **BM25**. This applies to sparse vector fields derived from BM25 functions.

- MAX_SIM

    Sets the metric type to **MAX_SIM**. This applies only to all vectors in Struct elements.

- MAX_SIM_COSINE

    Sets the metric type to **MAX_SIM_COSINE**. This applies only to float vectors in Struct elements.

- MAX_SIM_IP

    Sets the metric type to **MAX_SIM_IP**. This applies only to float vectors in Struct elements.

- MAX_SIM_L2

    Sets the metric type to **MAX_SIM_L2**. This applies only to float vectors in Struct elements.

- MAX_SIM_JACCARD

    Sets the metric type to **MAX_SIM_JACCARD**. This applies only to binary vectors in Struct elements.

- MAX_SIM_HAMMING

    Sets the metric type to **MAX_SIM_HAMMING**. This applies only to binary vectors in Struct elements.

