---
displayed_sidebar: paasSidebar
slug: /docs/byoc/search-metrics-explained
beta: TRUE
notebook: FALSE
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# Similarity Metrics Explained

Similarity metrics are used to measure similarities among vectors. Choosing an appropriate distance metric helps improve classification and clustering performance significantly.

Currently, Zilliz Cloud supports three types of similarity Metrics: **Euclidean distance (L2)**, **Inner product (IP)**, and **Cosine similarity (COSINE)**.

## Euclidean distance (L2){#euclidean-distance-l2}

Essentially, Euclidean distance measures the length of a segment that connects 2 points.

The formula for Euclidean distance is as follows:

![HtxnbRRwhoXGX8xYTJPcUS0KnCh](/byoc/HtxnbRRwhoXGX8xYTJPcUS0KnCh.png)

where **a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** and **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** are two points in n-dimensional Euclidean space.

It's the most commonly used distance metric and is very useful when the data are continuous.

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud only calculates the value before applying the square root when Euclidean distance is chosen as the distance metric.

</Admonition>

## Inner product (IP){#inner-product-ip}

The IP distance between two embeddings is defined as follows:

![X2NebUU5OogaZGxl7lwcrZhgnKg](/byoc/X2NebUU5OogaZGxl7lwcrZhgnKg.png)

IP is more useful if you need to compare non-normalized data or when you care about magnitude and angle.

<Admonition type="info" icon="📘" title="Notes">

If you use IP to calculate similarities between embeddings, you must normalize your embeddings. After normalization, the inner product equals cosine similarity.

</Admonition>

Suppose X' is normalized from embedding X:

![CQOTbuIS6oqcp8xmIK6csUJdnbh](/byoc/CQOTbuIS6oqcp8xmIK6csUJdnbh.png)

The correlation between the two embeddings is as follows:

![UgebbKhefovb1KxFJfmcg1w1nng](/byoc/UgebbKhefovb1KxFJfmcg1w1nng.png)

## Cosine similarity {#cosine-similarity}

Cosine similarity uses the cosine of the angle between two sets of vectors to measure how similar they are. You can think of the two sets of vectors as line segments starting from the same point, such as [0,0,...], but pointing in different directions.

To calculate the cosine similarity between two sets of vectors **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** and **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)**, use the following formula:

![WkObbyuhJoiG1IxJY59co6M5nag](/byoc/WkObbyuhJoiG1IxJY59co6M5nag.png)

The cosine similarity is always in the interval **[-1, 1]**. For example, two proportional vectors have a cosine similarity of **1**, two orthogonal vectors have a similarity of **0**, and two opposite vectors have a similarity of **-1**. The larger the cosine, the smaller the angle between the two vectors, indicating that these two vectors are more similar to each other.

By subtracting their cosine similarity from 1, you can get the cosine distance between two vectors.

<Admonition type="info" icon="📘" title="Notes">

This is currently in beta. Upgrade your cluster to the beta version to utilize this new similarity metric.

</Admonition>