---
title: "Metric Types | Cloud"
slug: /search-metrics-explained
sidebar_label: "Metric Types"
beta: FALSE
notebook: FALSE
description: "Similarity metrics are used to measure similarities among vectors. Choosing an appropriate distance metric helps improve classification and clustering performance significantly. | Cloud"
type: origin
token: EOxmwUDxMiy2cpkOfIsc1dYzn4c
sidebar_position: 17
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search metrics
  - metric types
  - L2
  - IP
  - COSINE
  - Jaccard
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window

---

import Admonition from '@theme/Admonition';


# Metric Types

Similarity metrics are used to measure similarities among vectors. Choosing an appropriate distance metric helps improve classification and clustering performance significantly.

Currently, Zilliz Cloud supports these types of similarity Metrics: Euclidean distance (`L2`), Inner Product (`IP`), Cosine Similarity (`COSINE`), `JACCARD`, `HAMMING`, and `BM25` (specifically designed for full text search on sparse vectors).

The table below summarizes the mapping between different field types and their corresponding metric types.

<table>
   <tr>
     <th><p>Field Type</p></th>
     <th><p>Dimension Range</p></th>
     <th><p>Supported Metric Types</p></th>
     <th><p>Default Metric Type</p></th>
   </tr>
   <tr>
     <td><p><code>FLOAT_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT16_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>BFLOAT16_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>SPARSE\_FLOAT\_VECTOR</code></p></td>
     <td><p>No need to specify the dimension.</p></td>
     <td><p><code>IP</code>, <code>BM25</code> (used only for full text search)</p></td>
     <td><p><code>IP</code></p></td>
   </tr>
   <tr>
     <td><p><code>BINARY_VECTOR</code></p></td>
     <td><p>8-32,768*8</p></td>
     <td><p><code>HAMMING</code>, <code>JACCARD</code></p></td>
     <td><p><code>HAMMING</code></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>For vector fields of the <code>SPARSE\_FLOAT\_VECTOR</code> type, use the <code>BM25</code> metric type only when performing full text search. For more information, refer to <a href="./full-text-search">Full Text Search</a>.</p></li>
<li><p>For vector fields of the <code>BINARY_VECTOR</code> type, the dimension value (<code>dim</code>) must be a multiple of 8. </p></li>
</ul>

</Admonition>

The table below summarizes the characteristics of the similarity distance values of all supported metric types and their value range.

<table>
   <tr>
     <th><p>Metric Type</p></th>
     <th><p>Characteristics of the Similarity Distance Values</p></th>
     <th><p>Similarity Distance Value Range</p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>A smaller value indicates a greater similarity.</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>A greater value indicates a greater similarity.</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>A greater value indicates a greater similarity.</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>A smaller value indicates a greater similarity.</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>A smaller value indicates a greater similarity.</p></td>
     <td><p>[0, dim(vector)]</p></td>
   </tr>
   <tr>
     <td><p><code>BM25</code></p></td>
     <td><p>Score the relevance based on the term frequency, inverted document frequency, and document normalization.</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
</table>

## Euclidean distance (L2){#euclidean-distance-l2}

Essentially, Euclidean distance measures the length of a segment that connects 2 points.

The formula for Euclidean distance is as follows:

![C8gHbw8dSozNslx9wXbcyt2hnLe](/img/C8gHbw8dSozNslx9wXbcyt2hnLe.png)

where **a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** and **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** are two points in n-dimensional Euclidean space.

It's the most commonly used distance metric and is very useful when the data are continuous.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud only calculates the value before applying the square root when Euclidean distance is chosen as the distance metric.</p>

</Admonition>

## Inner product (IP){#inner-product-ip}

The IP distance between two embeddings is defined as follows:

![Dqp4b8OP3oaQWgxZqoycL3ainwg](/img/Dqp4b8OP3oaQWgxZqoycL3ainwg.png)

IP is more useful if you need to compare non-normalized data or when you care about magnitude and angle.

<Admonition type="info" icon="📘" title="Notes">

<p>If you use IP to calculate similarities between embeddings, you must normalize your embeddings. After normalization, the inner product equals cosine similarity.</p>

</Admonition>

Suppose X' is normalized from embedding X:

![U23obWPTJoID9KxeGyjc1HAXn9d](/img/U23obWPTJoID9KxeGyjc1HAXn9d.png)

The correlation between the two embeddings is as follows:

![SHDAb6UUgo7qR6xLXb5cv4bKnke](/img/SHDAb6UUgo7qR6xLXb5cv4bKnke.png)

## Cosine similarity{#cosine-similarity}

Cosine similarity uses the cosine of the angle between two sets of vectors to measure how similar they are. You can think of the two sets of vectors as line segments starting from the same point, such as [0,0,...], but pointing in different directions.

To calculate the cosine similarity between two sets of vectors **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** and **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)**, use the following formula:

![R1iNbuEDDoz8RdxtA4RcM706nMc](/img/R1iNbuEDDoz8RdxtA4RcM706nMc.png)

The cosine similarity is always in the interval **[-1, 1]**. For example, two proportional vectors have a cosine similarity of **1**, two orthogonal vectors have a similarity of **0**, and two opposite vectors have a similarity of **-1**. The larger the cosine, the smaller the angle between the two vectors, indicating that these two vectors are more similar to each other.

By subtracting their cosine similarity from 1, you can get the cosine distance between two vectors.

## JACCARD distance{#jaccard-distance}

JACCARD similarity coefficient measures the similarity between two sample sets and is defined as the cardinality of the intersection of the defined sets divided by the cardinality of the union of them. It can only be applied to finite sample sets.

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](/img/Sl4dbmQRVoIf1yx55mRcibZ3nAg.png)

JACCARD distance measures the dissimilarity between data sets and is obtained by subtracting the JACCARD similarity coefficient from 1. For binary variables, JACCARD distance is equivalent to the Tanimoto coefficient.

![Kj2kbpNmHoTUUixjDC1ccTntnnV](/img/Kj2kbpNmHoTUUixjDC1ccTntnnV.png)

## HAMMING distance{#hamming-distance}

HAMMING distance measures binary data strings. The distance between two strings of equal length is the number of bit positions at which the bits are different.

For example, suppose there are two strings, 1101 1001 and 1001 1101.

11011001 ⊕ 10011101 = 01000100. Since, this contains two 1s, the HAMMING distance, d (11011001, 10011101) = 2.

## BM25 similarity{#bm25-similarity}

BM25 is a widely used text relevance measurement method, specifically designed for [full text search](./full-text-search). It combines the following three key factors:

- **Term Frequency (TF):** Measures how frequently a term appears in a document. While higher frequencies often indicate greater importance, BM25 uses the saturation parameter  to prevent overly frequent terms from dominating the relevance score.

- **Inverse Document Frequency (IDF):** Reflects the importance of a term across the entire corpus. Terms appearing in fewer documents receive a higher IDF value, indicating greater contribution to relevance.

- **Document Length Normalization:** Longer documents tend to score higher due to containing more terms. BM25 mitigates this bias by normalizing document lengths, with parameter  controlling the strength of this normalization.

The BM25 scoring is calculated as follows:

Parameter description:

- : The query text provided by the user.

- : The document being evaluated.

- : Term frequency, representing how often term appears in document .

- : Inverse document frequency, calculated as:

    where  is the total number of documents in the corpus, and is the number of documents containing term .

- : Length of document  (total number of terms).

- : Average length of all documents in the corpus.

- : Controls the influence of term frequency on the score. Higher values increase the importance of term frequency. The typical range is [1.2, 2.0], while Zilliz Cloud allows a range of [0, 3].

- : Controls the degree of length normalization, ranging from 0 to 1. When the value is 0, no normalization is applied; when the value is 1, full normalization is applied.

