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
  - vector search algorithms
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

これは、以下の定数を提供する列挙型です。

## Constants\{#constants}

- INVALID

    メトリックタイプを **INVALID** に設定します。

- L2

    メトリックタイプを **L2** に設定します。これは float vector にのみ適用されます。

- IP

    メトリックタイプを **IP** に設定します。これは float vector にのみ適用されます。

- COSINE

    メトリックタイプを **COSINE** に設定します。これは float vector にのみ適用されます。

- HAMMING

    メトリックタイプを **HAMMING** に設定します。これは binary vector にのみ適用されます。

- JACCARD

    メトリックタイプを **JACCARD** に設定します。これは binary vector にのみ適用されます。

- BM25

    メトリックタイプを **BM25** に設定します。これは BM25 関数から導出された sparse vector フィールドに適用されます。

- MAX_SIM

    メトリックタイプを **MAX_SIM** に設定します。これは Struct 要素内のすべての vector にのみ適用されます。

- MAX_SIM_COSINE

    メトリックタイプを **MAX_SIM_COSINE** に設定します。これは Struct 要素内の float vector にのみ適用されます。

- MAX_SIM_IP

    メトリックタイプを **MAX_SIM_IP** に設定します。これは Struct 要素内の float vector にのみ適用されます。

- MAX_SIM_L2

    メトリックタイプを **MAX_SIM_L2** に設定します。これは Struct 要素内の float vector にのみ適用されます。

- MAX_SIM_JACCARD

    メトリックタイプを **MAX_SIM_JACCARD** に設定します。これは Struct 要素内の binary vector にのみ適用されます。

- MAX_SIM_HAMMING

    メトリックタイプを **MAX_SIM_HAMMING** に設定します。これは Struct 要素内の binary vector にのみ適用されます。

