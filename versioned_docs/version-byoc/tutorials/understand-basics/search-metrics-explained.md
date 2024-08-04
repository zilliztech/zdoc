---
title: "Similarity Metrics Explained | BYOC"
slug: /search-metrics-explained
sidebar_label: "Similarity Metrics Explained"
beta: TRUE
notebook: FALSE
description: "Similarity metrics are used to measure similarities among vectors. Choosing an appropriate distance metric helps improve classification and clustering performance significantly. | BYOC"
type: origin
token: TlfCwYUusikxUGkxsGGcO6eXnig
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - similarity metrics
  - milvus

---

import Admonition from '@theme/Admonition';


# Similarity Metrics Explained

Similarity metrics are used to measure similarities among vectors. Choosing an appropriate distance metric helps improve classification and clustering performance significantly.

Currently, Zilliz Cloud supports these types of similarity Metrics: **Euclidean distance (L2)**, **Inner product (IP)**, **Cosine similarity (COSINE)**, **JACCARD** <sup>(Beta)</sup>, and **HAMMING** <sup>(Beta)</sup>.

The table below summarizes the mapping between different field types and their corresponding metric types.

<table>
   <tr>
     <th><p>Field Type</p></th>
     <th><p>Dimension Range</p></th>
     <th><p>Supported Metric Types</p></th>
     <th><p>Default Metric Type</p></th>
   </tr>
   <tr>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>2-32,768</p></td>
     <td><p>Cosine, L2, IP</p></td>
     <td><p>Cosine</p></td>
   </tr>
   <tr>
     <td><p>FLOAT16_VECTOR <sup>(Beta)</sup></p></td>
     <td><p>2-32,768</p></td>
     <td><p>Cosine, L2, IP</p></td>
     <td><p>Cosine</p></td>
   </tr>
   <tr>
     <td><p>BFLOAT16_VECTOR <sup>(Beta)</sup></p></td>
     <td><p>2-32,768</p></td>
     <td><p>Cosine, L2, IP</p></td>
     <td><p>Cosine</p></td>
   </tr>
   <tr>
     <td><p>SPARSE_FLOAT_VECTOR <sup>(Beta)</sup></p></td>
     <td><p>No need to specify the dimension.</p></td>
     <td><p>IP</p></td>
     <td><p>IP</p></td>
   </tr>
   <tr>
     <td><p>BINARY_VECTOR <sup>(Beta)</sup></p></td>
     <td><p>8-32,768*8</p></td>
     <td><p>HAMMING <sup>(Beta)</sup>, JACCARD <sup>(Beta)</sup></p></td>
     <td><p>HAMMING <sup>(Beta)</sup></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="For vector fields of the `BINARY_VECTOR` type,">

<ul>
<li><p>The dimension value (<code>dim</code>) must be a multiple of 8.</p></li>
<li><p>The available metric types are <code>HAMMING</code> and <code>JACCARD</code>.</p></li>
</ul>

</Admonition>

## Euclidean distance (L2){#euclidean-distance-l2}

Essentially, Euclidean distance measures the length of a segment that connects 2 points.

The formula for Euclidean distance is as follows:

![HtxnbRRwhoXGX8xYTJPcUS0KnCh](/byoc/HtxnbRRwhoXGX8xYTJPcUS0KnCh.png)

where **a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** and **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** are two points in n-dimensional Euclidean space.

It's the most commonly used distance metric and is very useful when the data are continuous.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud only calculates the value before applying the square root when Euclidean distance is chosen as the distance metric.</p>

</Admonition>

## Inner product (IP){#inner-product-ip}

The IP distance between two embeddings is defined as follows:

![X2NebUU5OogaZGxl7lwcrZhgnKg](/byoc/X2NebUU5OogaZGxl7lwcrZhgnKg.png)

IP is more useful if you need to compare non-normalized data or when you care about magnitude and angle.

<Admonition type="info" icon="📘" title="Notes">

<p>If you use IP to calculate similarities between embeddings, you must normalize your embeddings. After normalization, the inner product equals cosine similarity.</p>

</Admonition>

Suppose X' is normalized from embedding X:

![CQOTbuIS6oqcp8xmIK6csUJdnbh](/byoc/CQOTbuIS6oqcp8xmIK6csUJdnbh.png)

The correlation between the two embeddings is as follows:

![UgebbKhefovb1KxFJfmcg1w1nng](/byoc/UgebbKhefovb1KxFJfmcg1w1nng.png)

## Cosine similarity{#cosine-similarity}

Cosine similarity uses the cosine of the angle between two sets of vectors to measure how similar they are. You can think of the two sets of vectors as line segments starting from the same point, such as [0,0,...], but pointing in different directions.

To calculate the cosine similarity between two sets of vectors **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** and **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)**, use the following formula:

![WkObbyuhJoiG1IxJY59co6M5nag](/byoc/WkObbyuhJoiG1IxJY59co6M5nag.png)

The cosine similarity is always in the interval **[-1, 1]**. For example, two proportional vectors have a cosine similarity of **1**, two orthogonal vectors have a similarity of **0**, and two opposite vectors have a similarity of **-1**. The larger the cosine, the smaller the angle between the two vectors, indicating that these two vectors are more similar to each other.

By subtracting their cosine similarity from 1, you can get the cosine distance between two vectors.

<Admonition type="info" icon="📘" title="Notes">

<p>This is currently in beta. Upgrade your cluster to the beta version to utilize this new similarity metric.</p>

</Admonition>

## JACCARD distance (Beta){#jaccard-distance-beta}

JACCARD similarity coefficient measures the similarity between two sample sets and is defined as the cardinality of the intersection of the defined sets divided by the cardinality of the union of them. It can only be applied to finite sample sets.

![YwyibzK9poGlkJxaddocu3lynJb](/byoc/YwyibzK9poGlkJxaddocu3lynJb.png)

JACCARD distance measures the dissimilarity between data sets and is obtained by subtracting the JACCARD similarity coefficient from 1. For binary variables, JACCARD distance is equivalent to the Tanimoto coefficient.

![H1aSbG70JorMGXxtXfTcRIO3nng](/byoc/H1aSbG70JorMGXxtXfTcRIO3nng.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, this similarity metric is available exclusively for clusters that have been upgraded to the Beta version.</p>

</Admonition>

## HAMMING distance (Beta){#hamming-distance-beta}

HAMMING distance measures binary data strings. The distance between two strings of equal length is the number of bit positions at which the bits are different.

For example, suppose there are two strings, 1101 1001 and 1001 1101.

11011001 ⊕ 10011101 = 01000100. Since, this contains two 1s, the HAMMING distance, d (11011001, 10011101) = 2.

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, this similarity metric is available exclusively for clusters that have been upgraded to the Beta version.</p>

</Admonition>

