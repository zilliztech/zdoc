---
title: "教程：实现基于时间的排序 | BYOC"
slug: /tutorial-implement-time-based-ranking
sidebar_label: "教程：实现基于时间的排序"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在许多搜索应用中，内容的时效性与相关性同样重要。新闻文章、产品列表、社交媒体帖子和研究论文都受益于能平衡语义相关性与时效性的排名系统。本教程将展示如何使用 Decay Ranker 在 Zilliz Cloud 中实现基于时间的排名。 | BYOC"
type: origin
token: Poidwz97ZiNIRDkvM9Xc68ELnGb
sidebar_position: 5
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - reranking
  - 重排
  - 搜索结果重排
  - 衰减
  - 教程

---

import Admonition from '@theme/Admonition';


# 教程：实现基于时间的排序

在许多搜索应用中，内容的时效性与相关性同样重要。新闻文章、产品列表、社交媒体帖子和研究论文都受益于能平衡语义相关性与时效性的排名系统。本教程将展示如何使用 Decay Ranker 在 Zilliz Cloud 中实现基于时间的排名。

## 了解 Decay Ranker\{#understand-decay-rankers}

Decay Ranker 允许您根据相对于参考点的数值（如时间戳）来提升或降低文档的权重。对于基于时间的排序，这意味着即使新文档和旧文档的语义相关性相似，新文档也能获得比旧文档更高的分数。

Zilliz Cloud 支持三种类型的 Decay Ranker：

- **高斯衰减** （`gauss`）：一种钟形曲线，提供平滑、渐进的衰减

- **指数衰减**（`exp`）：为强烈强调近期内容创建更陡峭的初始衰减

- **线性衰减** （`linear`）：一种可预测且易于理解的直线衰减

每个 Ranker 都有不同的特性，使其适用于各种用例。如需更多信息，请参考[Decay Ranker 概述](./decay-ranker-oveview)。

## 构建一个时间感知搜索系统\{#build-a-time-aware-search-system}

我们将创建一个新闻文章搜索系统，展示如何基于相关性和时间对内容进行有效排序。让我们从实现开始：

```python
import datetime
import matplotlib.pyplot as plt
import numpy as np
from pymilvus import (
    MilvusClient,
    DataType,
    Function,
    FunctionType,
    AnnSearchRequest,
)

# Create connection to Milvus
milvus_client = MilvusClient("YOUR_CLUSTER_ENDPOINT")

# Define collection name
collection_name = "news_articles_tutorial"

# Clean up any existing collection with the same name
milvus_client.drop_collection(collection_name)
```

## 步骤1：设计 Schema\{#step-1-design-the-schema}

对于基于时间的搜索，我们需要将发布时间戳与内容一起存储：

```python
# Create schema with fields for content and temporal information
schema = milvus_client.create_schema(enable_dynamic_field=False, auto_id=True)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("headline", DataType.VARCHAR, max_length=200, enable_analyzer=True)
schema.add_field("content", DataType.VARCHAR, max_length=2000, enable_analyzer=True)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)  # For dense embeddings
schema.add_field("sparse_vector", DataType.SPARSE_FLOAT_VECTOR)  # For sparse (BM25) search
schema.add_field("publish_date", DataType.INT64)  # Timestamp for decay ranking
```

## 步骤2：设置嵌入函数\{#step-2-set-up-embedding-functions}

我们将配置密集（语义）和稀疏（关键词）嵌入函数：

```python
# Create embedding function for semantic search
text_embedding_function = Function(
    name="siliconflow_embedding",
    function_type=FunctionType.TEXTEMBEDDING,
    input_field_names=["content"],
    output_field_names=["dense"],
    params={
        "provider": "siliconflow",
        "model_name": "BAAI/bge-large-en-v1.5",
        "credential": "your-api-key"
    }
)
schema.add_function(text_embedding_function)

# Create BM25 function for keyword search
bm25_function = Function(
    name="bm25",
    input_field_names=["content"],
    output_field_names=["sparse_vector"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
```

## 步骤3：配置索引参数\{#step-3-configure-index-parameters}

让我们为快速向量搜索设置适当的索引参数：

```python
# Set up indexes for fast search
index_params = milvus_client.prepare_index_params()

# Dense vector index
index_params.add_index(field_name="dense", index_type="AUTOINDEX", metric_type="L2")

# Sparse vector index
index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_inverted_index",
    index_type="AUTOINDEX",
    metric_type="BM25",
)

# Create the collection with our schema and indexes
milvus_client.create_collection(
    collection_name,
    schema=schema,
    index_params=index_params,
    consistency_level="Strong"
)
```

## 步骤4：准备样本数据\{#step-4-prepare-sample-data}

在本教程中，我们将创建一组具有不同发布日期的新闻文章。请注意，我们如何纳入了内容几乎相同但日期不同的文章对，以清晰展示衰减排名效果：

```python
# Get current time
current_time = int(datetime.datetime.now().timestamp())
current_date = datetime.datetime.fromtimestamp(current_time)
print(f"Current time: {current_date.strftime('%Y-%m-%d %H:%M:%S')}")

# Sample news articles spanning different dates
articles = [
    {
        "headline": "AI Breakthrough Enables Medical Diagnosis Advancement",
        "content": "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.",
        "publish_date": int((current_date - datetime.timedelta(days=120)).timestamp())  # ~4 months ago
    },
    {
        "headline": "Tech Giants Compete in New AI Race",
        "content": "Major technology companies are investing billions in a new race to develop the most advanced artificial intelligence systems.",
        "publish_date": int((current_date - datetime.timedelta(days=60)).timestamp())  # ~2 months ago
    },
    {
        "headline": "AI Ethics Guidelines Released by International Body",
        "content": "A consortium of international organizations has released new guidelines addressing ethical concerns in artificial intelligence development and deployment.",
        "publish_date": int((current_date - datetime.timedelta(days=30)).timestamp())  # 1 month ago
    },
    {
        "headline": "Latest Deep Learning Models Show Remarkable Progress",
        "content": "The newest generation of deep learning models demonstrates unprecedented capabilities in language understanding and generation.",
        "publish_date": int((current_date - datetime.timedelta(days=15)).timestamp())  # 15 days ago
    },
    # Articles with identical content but different dates
    {
        "headline": "AI Research Advancements Published in January",
        "content": "Breakthrough research in artificial intelligence shows remarkable advancements in multiple domains.",
        "publish_date": int((current_date - datetime.timedelta(days=90)).timestamp())  # ~3 months ago
    },
    {
        "headline": "New AI Research Results Released This Week",
        "content": "Breakthrough research in artificial intelligence shows remarkable advancements in multiple domains.",
        "publish_date": int((current_date - datetime.timedelta(days=5)).timestamp())  # Very recent - 5 days ago
    },
    {
        "headline": "AI Development Updates Released Yesterday",
        "content": "Recent developments in artificial intelligence research are showing promising results across various applications.",
        "publish_date": int((current_date - datetime.timedelta(days=1)).timestamp())  # Just yesterday
    },
]

# Insert articles into the collection
milvus_client.insert(collection_name, articles)
print(f"Inserted {len(articles)} articles into the collection")
```

## 步骤5：配置不同的 Decay Ranker\{#step-5-configure-different-decay-rankers}

现在，让我们创建三个不同的 Decay Ranker，每个排序器都有不同的参数，以突出它们的差异：

```python
# Use current time as reference point
print(f"Using current time as reference point")

# Create a Gaussian decay ranker
gaussian_ranker = Function(
    name="time_decay_gaussian",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "gauss",           # Gaussian/bell curve decay
        "origin": current_time,        # Current time as reference point
        "offset": 7 * 24 * 60 * 60,    # One week (full relevance)
        "decay": 0.5,                  # Articles from two weeks ago have half relevance 
        "scale": 14 * 24 * 60 * 60     # Two weeks scale parameter
    }
)

# Create an exponential decay ranker with different parameters
exponential_ranker = Function(
    name="time_decay_exponential",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "exp",             # Exponential decay
        "origin": current_time,        # Current time as reference point
        "offset": 3 * 24 * 60 * 60,    # Shorter offset (3 days vs 7 days)
        "decay": 0.3,                  # Steeper decay (0.3 vs 0.5) 
        "scale": 10 * 24 * 60 * 60     # Different scale (10 days vs 14 days)
    }
)

# Create a linear decay ranker
linear_ranker = Function(
    name="time_decay_linear",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "linear",          # Linear decay
        "origin": current_time,        # Current time as reference point
        "offset": 7 * 24 * 60 * 60,    # One week (full relevance)
        "decay": 0.5,                  # Articles from two weeks ago have half relevance
        "scale": 14 * 24 * 60 * 60     # Two weeks scale parameter
    }
)
```

在前面的代码中：

- `reranker`：对于基于时间的衰减函数，设置为 `decay`

- `function`：衰减函数的类型（`gauss`、`exp` 或 `linear`）

- `origin`：参考点（通常为当前时间）

- `offset`：文档保持完全相关性的时间段

- `scale`：控制相关性在偏移量之外降低的速度

- `decay`：偏移量+比例下的衰减因子（例如，0.5表示相关性减半）

请注意，我们已使用不同的参数配置了指数排序器，以展示如何针对不同的行为调整这些函数。

## 步骤6：可视化 Decay Ranker\{#step-6-visualize-the-decay-rankers}

在进行搜索之前，让我们先直观地比较一下这些配置不同的 Decay Ranker 的表现：

```python
# Visualize the decay functions with different parameters
days = np.linspace(0, 90, 100)
# Gaussian: offset=7, scale=14, decay=0.5
gaussian_values = [1.0 if d <= 7 else (0.5 ** ((d - 7) / 14)) for d in days]
# Exponential: offset=3, scale=10, decay=0.3
exponential_values = [1.0 if d <= 3 else (0.3 ** ((d - 3) / 10)) for d in days]
# Linear: offset=7, scale=14, decay=0.5
linear_values = [1.0 if d <= 7 else max(0, 1.0 - ((d - 7) / 14) * 0.5) for d in days]

plt.figure(figsize=(10, 6))
plt.plot(days, gaussian_values, label='Gaussian (offset=7, scale=14, decay=0.5)')
plt.plot(days, exponential_values, label='Exponential (offset=3, scale=10, decay=0.3)')
plt.plot(days, linear_values, label='Linear (offset=7, scale=14, decay=0.5)')
plt.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5, label='Half relevance')
plt.xlabel('Days ago')
plt.ylabel('Relevance factor')
plt.title('Decay Functions Comparison')
plt.legend()
plt.grid(True)
plt.savefig('decay_functions.png')
plt.close()

# Print numerical representation
print("\n=== TIME DECAY EFFECT VISUALIZATION ===")
print("Days ago | Gaussian | Exponential | Linear")
print("-----------------------------------------")
for days in [0, 3, 7, 10, 14, 21, 30, 60, 90]:
    # Calculate decay factors based on the parameters in our rankers
    gaussian_decay = 1.0 if days <= 7 else (0.5 ** ((days - 7) / 14))
    exponential_decay = 1.0 if days <= 3 else (0.3 ** ((days - 3) / 10))
    linear_decay = 1.0 if days <= 7 else max(0, 1.0 - ((days - 7) / 14) * 0.5)
    
    print(f"{days:2d} days | {gaussian_decay:.4f}   | {exponential_decay:.4f}     | {linear_decay:.4f}")
```

预期输出：

```python
=== TIME DECAY EFFECT VISUALIZATION ===
Days ago | Gaussian | Exponential | Linear
-----------------------------------------
 0 days | 1.0000   | 1.0000     | 1.0000
 3 days | 1.0000   | 1.0000     | 1.0000
 7 days | 1.0000   | 0.6178     | 1.0000
10 days | 0.8620   | 0.4305     | 0.8929
14 days | 0.7071   | 0.2660     | 0.7500
21 days | 0.5000   | 0.1145     | 0.5000
30 days | 0.3202   | 0.0387     | 0.1786
60 days | 0.0725   | 0.0010     | 0.0000
90 days | 0.0164   | 0.0000     | 0.0000
```

## 步骤7：用于结果显示的辅助函数\{#step-7-helper-function-for-results-display}

```python
# Helper function to format search results with dates and scores
def print_search_results(results, title):
    print(f"\n=== {title} ===")
    for i, hit in enumerate(results[0]):
        publish_date = datetime.datetime.fromtimestamp(hit.get('publish_date'))
        days_from_now = (current_time - hit.get('publish_date')) / (24 * 60 * 60)
        
        print(f"{i+1}. {hit.get('headline')}")
        print(f"   Published: {publish_date.strftime('%Y-%m-%d')} ({int(days_from_now)} days ago)")
        print(f"   Score: {hit.score:.4f}")
        print()
```

## 步骤8：比较标准搜索与基于衰减的搜索\{#step-8-compare-standard-vs-decay-based-search}

现在，让我们运行一个搜索查询，并比较有衰减排名和无衰减排名的结果：

```python
# Define our search query
query = "artificial intelligence advancements"

# 1. Search without decay ranking (purely based on semantic relevance)
standard_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,  # Get all our articles
    output_fields=["headline", "content", "publish_date"],
    consistency_level="Strong"
)
print_search_results(standard_results, "SEARCH RESULTS WITHOUT DECAY RANKING")

# Store original scores for later comparison
original_scores = {}
for hit in standard_results[0]:
    original_scores[hit.get('headline')] = hit.score

# 2. Search with each decay function
# Gaussian decay
gaussian_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=gaussian_ranker,
    consistency_level="Strong"
)
print_search_results(gaussian_results, "SEARCH RESULTS WITH GAUSSIAN DECAY RANKING")

# Exponential decay
exponential_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=exponential_ranker,
    consistency_level="Strong"
)
print_search_results(exponential_results, "SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING")

# Linear decay
linear_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=linear_ranker,
    consistency_level="Strong"
)
print_search_results(linear_results, "SEARCH RESULTS WITH LINEAR DECAY RANKING")
```

预期输出：

```python
=== SEARCH RESULTS WITHOUT DECAY RANKING ===
1. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

2. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.4315

3. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

4. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.6671

5. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6674

6. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.7279

7. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.7661

=== SEARCH RESULTS WITH GAUSSIAN DECAY RANKING ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.5322

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

3. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.1180

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING ===
1. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.3392

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.1574

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0297

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0007

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH RESULTS WITH LINEAR DECAY RANKING ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.4767

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

3. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.3831

4. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

5. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.3640

6. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.3335

7. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.2158
```

## 步骤9：了解得分计算\{#step-9-understand-score-calculation}

让我们来详细分析一下最终得分是如何通过将原始相关性与衰减因子相结合来计算的：

```python
# Add a detailed breakdown for the first 3 results from Gaussian decay
print("\n=== SCORE CALCULATION BREAKDOWN (GAUSSIAN DECAY) ===")
for item in gaussian_results[0][:3]:
    headline = item.get('headline')
    publish_date = datetime.datetime.fromtimestamp(item.get('publish_date'))
    days_ago = (current_time - item.get('publish_date')) / (24 * 60 * 60)
    
    # Get the original score
    original_score = original_scores.get(headline, 0)
    
    # Calculate decay factor
    decay_factor = 1.0 if days_ago <= 7 else (0.5 ** ((days_ago - 7) / 14))
    
    # Show breakdown
    print(f"Item: {headline}")
    print(f"  Published: {publish_date.strftime('%Y-%m-%d')} ({int(days_ago)} days ago)")
    print(f"  Original relevance score: {original_score:.4f}")
    print(f"  Decay factor (Gaussian): {decay_factor:.4f}")
    print(f"  Expected final score = Original × Decay: {original_score * decay_factor:.4f}")
    print(f"  Actual final score: {item.score:.4f}")
    print()
```

预期输出：

```python
=== SCORE CALCULATION BREAKDOWN (GAUSSIAN DECAY) ===
Item: Latest Deep Learning Models Show Remarkable Progress
  Published: 2025-04-30 (15 days ago)
  Original relevance score: 0.6674
  Decay factor (Gaussian): 0.6730
  Expected final score = Original × Decay: 0.4491
  Actual final score: 0.5322

Item: New AI Research Results Released This Week
  Published: 2025-05-10 (5 days ago)
  Original relevance score: 0.4316
  Decay factor (Gaussian): 1.0000
  Expected final score = Original × Decay: 0.4316
  Actual final score: 0.4316

Item: AI Development Updates Released Yesterday
  Published: 2025-05-14 (1 days ago)
  Original relevance score: 0.3670
  Decay factor (Gaussian): 1.0000
  Expected final score = Original × Decay: 0.3670
  Actual final score: 0.3670
```

## 步骤10：带时间衰减的混合搜索\{#step-10-hybrid-search-with-time-decay}

对于更复杂的场景，我们可以使用混合搜索来结合密集（语义）和稀疏（关键词）向量：

```python
# Set up hybrid search (combining dense and sparse vectors)
dense_search = AnnSearchRequest(
    data=[query],
    anns_field="dense",  # Search dense vectors
    param={},
    limit=7
)

sparse_search = AnnSearchRequest(
    data=[query],
    anns_field="sparse_vector",  # Search sparse vectors (BM25)
    param={},
    limit=7
)

# Execute hybrid search with each decay function
# Gaussian decay
hybrid_gaussian_results = milvus_client.hybrid_search(
    collection_name,
    [dense_search, sparse_search],
    ranker=gaussian_ranker,
    limit=7,
    output_fields=["headline", "content", "publish_date"]
)
print_search_results(hybrid_gaussian_results, "HYBRID SEARCH RESULTS WITH GAUSSIAN DECAY RANKING")

# Exponential decay
hybrid_exponential_results = milvus_client.hybrid_search(
    collection_name,
    [dense_search, sparse_search],
    ranker=exponential_ranker,
    limit=7,
    output_fields=["headline", "content", "publish_date"]
)
print_search_results(hybrid_exponential_results, "HYBRID SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING")
```

预期输出：

```python
=== HYBRID SEARCH RESULTS WITH GAUSSIAN DECAY RANKING ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 2.1467

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7926

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.5322

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.1180

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== HYBRID SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 1.6873

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7926

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.1574

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0297

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0007

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0001

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000
```

## 步骤11：尝试不同的参数值\{#step-11-experiment-with-different-parameter-values}

让我们看看调整尺度参数如何影响高斯衰减函数：

```python
# Create variations of the Gaussian decay function with different scale parameters
print("\n=== PARAMETER VARIATION EXPERIMENT: SCALE ===")
for scale_days in [7, 14, 30]:
    scaled_ranker = Function(
        name=f"time_decay_gaussian_{scale_days}",
        input_field_names=["publish_date"],
        function_type=FunctionType.RERANK,
        params={
            "reranker": "decay",
            "function": "gauss",
            "origin": current_time,
            "offset": 7 * 24 * 60 * 60,  # Fixed offset of 7 days
            "decay": 0.5,                # Fixed decay of 0.5
            "scale": scale_days * 24 * 60 * 60  # Variable scale
        }
    )
    
    # Get results
    scale_results = milvus_client.search(
        collection_name,
        data=[query],
        anns_field="dense",
        limit=7,
        output_fields=["headline", "content", "publish_date"],
        ranker=scaled_ranker,
        consistency_level="Strong"
    )
    
    print_search_results(scale_results, f"SEARCH WITH GAUSSIAN DECAY (SCALE = {scale_days} DAYS)")
```

预期输出：

```python
=== PARAMETER VARIATION EXPERIMENT: SCALE ===

=== SEARCH WITH GAUSSIAN DECAY (SCALE = 7 DAYS) ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.2699

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0004

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH WITH GAUSSIAN DECAY (SCALE = 14 DAYS) ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.5322

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

3. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.1180

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH WITH GAUSSIAN DECAY (SCALE = 30 DAYS) ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6353

2. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.5097

3. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

4. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0767

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0021

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000
```

## 步骤12：使用不同查询进行测试\{#step-12-testing-with-different-queries}

让我们看看衰减排名在不同搜索查询下的表现如何：

```python
# Try different queries with Gaussian decay
for test_query in ["machine learning", "neural networks", "ethics in AI"]:
    print(f"\n=== TESTING QUERY: '{test_query}' WITH GAUSSIAN DECAY ===")
    test_results = milvus_client.search(
        collection_name,
        data=[test_query],
        anns_field="dense",
        limit=4,
        output_fields=["headline", "content", "publish_date"],
        ranker=gaussian_ranker,
        consistency_level="Strong"
    )
    print_search_results(test_results, f"TOP 4 RESULTS FOR '{test_query}'")
```

预期输出：

```python
=== TESTING QUERY: 'machine learning' WITH GAUSSIAN DECAY ===

=== TOP 4 RESULTS FOR 'machine learning' ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.8208

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7287

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6633

4. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

=== TESTING QUERY: 'neural networks' WITH GAUSSIAN DECAY ===

=== TOP 4 RESULTS FOR 'neural networks' ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.8509

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7574

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6364

4. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

=== TESTING QUERY: 'ethics in AI' WITH GAUSSIAN DECAY ===

=== TOP 4 RESULTS FOR 'ethics in AI' ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.7977

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7322

3. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0814

4. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000
```

## 结论\{#conclusion}

在 Zilliz Cloud 中使用衰减函数进行基于时间的排序，提供了一种强大的方式来平衡语义相关性和时效性。通过配置适当的衰减函数和参数，您可以创建既能突出新内容又能兼顾语义相关性的搜索体验。

这种方法对以下方面特别有价值：

- 新闻和媒体平台

- 电子商务产品列表

- 社交媒体内容源

- 知识库和留档系统

- 研究论文资料库

通过理解衰减函数背后的数学原理，并尝试不同的参数，你可以微调你的搜索系统，从而为你的特定用例在相关性和新鲜度之间实现最佳平衡。