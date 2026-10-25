---
title: "MetricType | Java | v2"
slug: /java/java/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "これは、以下の定数を提供する列挙型です。 | Java | v2"
type: docx
token: GEcrdVWnboOetOx08RrcRHVhn3g
sidebar_position: 14
keywords: 
  - マルチモーダル検索
  - ベクトル search algorithms
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MetricType

これは、以下の定数を提供する列挙型です。

## Constants\{#constants}

- INVALID

    メトリックタイプを **INVALID** に設定します。

- L2

    Sets the metric type to **L2**. This applies to float ベクトル only.

- IP

    Sets the metric type to **IP**. This applies to float ベクトル only.

- COSINE

    Sets the metric type to **COSINE**. This applies to float ベクトル only.

- HAMMING

    Sets the metric type to **HAMMING**. This applies to binary ベクトル only.

- JACCARD

    Sets the metric type to **JACCARD**. This applies to binary ベクトル only.

- BM25

    Sets the metric type to **BM25**. This applies to sparse ベクトル fields derived from BM25 functions.

- MAX_SIM

    Sets the metric type to **MAX_SIM**. This applies only to all ベクトル in Struct elements.

- MAX_SIM_COSINE

    Sets the metric type to **MAX_SIM_COSINE**. This applies only to float ベクトル in Struct elements.

- MAX_SIM_IP

    Sets the metric type to **MAX_SIM_IP**. This applies only to float ベクトル in Struct elements.

- MAX_SIM_L2

    Sets the metric type to **MAX_SIM_L2**. This applies only to float ベクトル in Struct elements.

- MAX_SIM_JACCARD

    Sets the metric type to **MAX_SIM_JACCARD**. This applies only to binary ベクトル in Struct elements.

- MAX_SIM_HAMMING

    Sets the metric type to **MAX_SIM_HAMMING**. This applies only to binary ベクトル in Struct elements.
