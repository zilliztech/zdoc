---
title: "Weighted Ranker | BYOC"
slug: /reranking-weighted-reranker
sidebar_label: "Weighted Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Weighted Ranker intelligently combines and prioritizes results from multiple search paths by assigning different importance weights to each. Similar to how a skilled chef balances multiple ingredients to create the perfect dish, Weighted Ranker balances different search results to deliver the most relevant combined outcomes. This approach is ideal when searching across multiple vector fields or modalities where certain fields should contribute more significantly to the final ranking than others. | BYOC"
type: origin
token: Oyy6w5DYJiVCMYkdduEc6eD9nZg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - weighted reranker
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Weighted Ranker

Weighted Ranker intelligently combines and prioritizes results from multiple search paths by assigning different importance weights to each. Similar to how a skilled chef balances multiple ingredients to create the perfect dish, Weighted Ranker balances different search results to deliver the most relevant combined outcomes. This approach is ideal when searching across multiple vector fields or modalities where certain fields should contribute more significantly to the final ranking than others.

## When to use Weighted Ranker{#when-to-use-weighted-ranker}

Weighted Ranker is specifically designed for hybrid search scenarios where you need to combine results from multiple vector search paths. It's particularly effective for:

<table>
   <tr>
     <th><p>Use Case</p></th>
     <th><p>Example</p></th>
     <th><p>Why Weighted Ranker Works Well</p></th>
   </tr>
   <tr>
     <td><p>E-commerce search</p></td>
     <td><p>Product search combining image similarity and text description</p></td>
     <td><p>Allows retailers to prioritize visual similarity for fashion items while emphasizing text descriptions for technical products</p></td>
   </tr>
   <tr>
     <td><p>Media content search</p></td>
     <td><p>Video retrieval using both visual features and audio transcripts</p></td>
     <td><p>Balances the importance of visual content versus spoken dialogue based on query intent</p></td>
   </tr>
   <tr>
     <td><p>Document retrieval</p></td>
     <td><p>Enterprise document search with multiple embeddings for different sections</p></td>
     <td><p>Gives higher weight to title and abstract embeddings while still considering full-text embeddings</p></td>
   </tr>
</table>

If your hybrid search application requires combining multiple search paths while controlling their relative importance, Weighted Ranker is your ideal choice.

## Mechanism of Weighted Ranker{#mechanism-of-weighted-ranker}

The main workflow of the WeightedRanker strategy is as follows:

1. **Collect Search Scores**: Gather the results and scores from each path of vector search (score_1, score_2).

1. **Score Normalization**: Each search may use different similarity metrics, resulting in varied score distributions. For instance, using Inner Product (IP) as a similarity type could result in scores ranging from &#91;−∞,+∞&#93;, while using Euclidean distance (L2) results in scores ranging from &#91;0,+∞&#93;. Because the score ranges from different searches vary and cannot be directly compared, it is necessary to normalize the scores from each path of search. Typically, `arctan` function is applied to transform the scores into a range between &#91;0, 1&#93; (score_1_normalized, score_2_normalized). Scores closer to 1 indicate higher similarity.

1. **Assign Weights**: Based on the importance assigned to different vector fields, weights (**wi**) are allocated to the normalized scores (score_1_normalized, score_2_normalized). The weights of each path should range between &#91;0,1&#93;. The resulting weighted scores are score_1_weighted and score_2_weighted.

1. **Merge Scores**: The weighted scores (score_1_weighted, score_2_weighted) are ranked from highest to lowest to produce a final set of scores (score_final).

![GdmNwbkN8haZO8bpQkOc2NIWnqF](/img/GdmNwbkN8haZO8bpQkOc2NIWnqF.png)

## Example of Weighted Ranker{#example-of-weighted-ranker}

This example demonstrates a multimodal Hybrid Search (topK=5) involving images and text and illustrates how the WeightedRanker strategy reranks the results from two ANN searches.

- Results of ANN search on images （topK=5)：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (image)</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>0.92</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>0.88</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>0.85</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>0.83</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>0.8</p></td>
       </tr>
    </table>

- Results of ANN search on texts （topK=5)：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (text)</strong></p></th>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>0.91</p></td>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>0.87</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>0.85</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>0.82</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>0.78</p></td>
       </tr>
    </table>

- Use WeightedRanker assign weights to image and text search results. Suppose the weight for the image ANN search is 0.6 and the weight for the text search is 0.4.

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (image)</strong></p></th>
         <th><p><strong>Score (text)</strong></p></th>
         <th><p><strong>Weighted Score</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>0.92</p></td>
         <td><p>0.87</p></td>
         <td><p>0.6×0.92+0.4×0.87=0.90</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>0.88</p></td>
         <td><p>N/A</p></td>
         <td><p>0.6×0.88+0.4×0=0.528</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>0.85</p></td>
         <td><p>N/A</p></td>
         <td><p>0.6×0.85+0.4×0=0.51</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>0.83</p></td>
         <td><p>0.91</p></td>
         <td><p>0.6×0.83+0.4×0.91=0.86</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>0.80</p></td>
         <td><p>0.82</p></td>
         <td><p>0.6×0.80+0.4×0.82=0.81</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>Not in Image</p></td>
         <td><p>0.85</p></td>
         <td><p>0.6×0+0.4×0.85=0.34</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>Not in Image</p></td>
         <td><p>0.78</p></td>
         <td><p>0.6×0+0.4×0.78=0.312</p></td>
       </tr>
    </table>

- The final results after reranking（topK=5)：

    <table>
       <tr>
         <th><p><strong>Rank</strong></p></th>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Final Score</strong></p></th>
       </tr>
       <tr>
         <td><p>1</p></td>
         <td><p>101</p></td>
         <td><p>0.90</p></td>
       </tr>
       <tr>
         <td><p>2</p></td>
         <td><p>198</p></td>
         <td><p>0.86</p></td>
       </tr>
       <tr>
         <td><p>3</p></td>
         <td><p>175</p></td>
         <td><p>0.81</p></td>
       </tr>
       <tr>
         <td><p>4</p></td>
         <td><p>203</p></td>
         <td><p>0.528</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>150</p></td>
         <td><p>0.51</p></td>
       </tr>
    </table>

## Usage of Weighted Ranker{#usage-of-weighted-ranker}

When using the WeightedRanker strategy, it is necessary to input weight values. The number of weight values to input should correspond to the number of basic ANN search requests in the Hybrid Search. The input weight values should fall in the range of &#91;0,1&#93;, with values closer to 1 indicating greater importance.

### Create a Weighted Ranker{#create-a-weighted-ranker}

For example, suppose there are two basic ANN search requests in a Hybrid Search: text search and image search. If the text search is considered more important, it should be assigned a greater weight.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import WeightedRanker

# Create a Weighted Ranker for multimodal search 
# Weight for first search path (0.8) and second search path (0.3)
rerank= WeightedRanker(0.8, 0.3) 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;

WeightedRanker rerank = new WeightedRanker(Arrays.asList(0.8f, 0.3f))
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

reranker := milvusclient.NewWeightedReranker([]float64{0.8, 0.3})
```

</TabItem>

<TabItem value='javascript'>

```javascript
rerank: WeightedRanker(0.8, 0.3)
```

</TabItem>

<TabItem value='bash'>

```bash
export rerank='{
        "strategy": "ws",
        "params": {"weights": [0.8,0.3]}
    }'
```

</TabItem>
</Tabs>

### Apply to hybrid search{#apply-to-hybrid-search}

Weighted Ranker is designed specifically for hybrid search operations that combine multiple vector fields. When performing hybrid search, you must specify the weights for each search path:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Connect to Milvus server
milvus_client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assume you have a collection setup

# Define text vector search request
text_search = AnnSearchRequest(
    data=["modern dining table"],
    anns_field="text_vector",
    param={},
    limit=10
)

# Define image vector search request
image_search = AnnSearchRequest(
    data=[image_embedding],  # Image embedding vector
    anns_field="image_vector",
    param={},
    limit=10
)

# Apply Weighted Ranker to product hybrid search
# Text search has 0.8 weight, image search has 0.3 weight
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # Multiple search requests
    # highlight-next-line
    ranker=rerank,  # Apply the weighted ranker
    limit=10,
    output_fields=["product_name", "price", "category"]
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

For more information on hybrid search, refer to [Multi-Vector Hybrid Search](./hybrid-search).