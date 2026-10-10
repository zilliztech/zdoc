---
title: "MetricType | Go | v2"
slug: /go/go/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A MetricType instance enumerates the distance metric types used for vector similarity search. | Go | v2"
type: docx
token: DWgIdWBkWoypMGx36Dmcf41AnGg
sidebar_position: 21
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

A MetricType instance enumerates the distance metric types used for vector similarity search.

```go
type MetricType string
```

**VALUES:**

- **L2** = "L2"

    Euclidean (L2) distance. Smaller values indicate greater similarity.

- **IP** = "IP"

    Inner product distance. Larger values indicate greater similarity.

- **COSINE** = "COSINE"

    Cosine similarity. Values range from -1 to 1, with 1 being most similar.

- **HAMMING** = "HAMMING"

    Hamming distance for binary vectors.

- **JACCARD** = "JACCARD"

    Jaccard distance for binary vectors.

- **TANIMOTO** = "TANIMOTO"

    Tanimoto distance for binary vectors.

- **SUBSTRUCTURE** = "SUBSTRUCTURE"

    Substructure distance for binary vectors.

- **SUPERSTRUCTURE** = "SUPERSTRUCTURE"

    Superstructure distance for binary vectors.

- **BM25** = "BM25"

    BM25 relevance scoring for full-text search.

- **MHJACCARD** = "MHJACCARD"

    MHJACCARD.

- **MaxSim** = "MAX_SIM"

    MaxSim.

- **MaxSimCosine** = "MAX_SIM_COSINE"

    MaxSimCosine.

- **MaxSimL2** = "MAX_SIM_L2"

    MaxSimL2.

- **MaxSimIP** = "MAX_SIM_IP"

    MaxSimIP.

- **MaxSimHamming** = "MAX_SIM_HAMMING"

    MaxSimHamming.

- **MaxSimJaccard** = "MAX_SIM_JACCARD"

    MaxSimJaccard.

## Example\{#example}

Demonstrates MetricType usage.

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle error
}

defer cli.Close(ctx)

// Use MetricType when creating an index
// L2 (Euclidean distance) for float vectors
hnswIndex := index.NewHNSWIndex(entity.L2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// IP (Inner Product) for normalized vectors
ipIndex := index.NewHNSWIndex(entity.IP, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "normalized_embedding", ipIndex))
if err != nil {
    // handle error
}
```
