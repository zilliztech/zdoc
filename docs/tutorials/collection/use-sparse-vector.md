---
title: "Use Sparse Vector | Cloud"
slug: /use-sparse-vector
sidebar_label: "Use Sparse Vector"
beta: TRUE
notebook: FALSE
description: "Sparse vectors represent words or phrases using vector embeddings where most elements are zero, with only one non-zero element indicating the presence of a specific word. Sparse vector models, such as SPLADEv2, outperform dense models in out-of-domain knowledge search, keyword-awareness, and interpretability. They are particularly useful in information retrieval, natural language processing, and recommendation systems, where combining sparse vectors for recall with a large model for ranking can significantly improve retrieval results. | Cloud"
type: origin
token: GJi1wGLKOiNW0OkBe9Ecsj9snob
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - sparse vector
  - milvus

---

import Admonition from '@theme/Admonition';


# Use Sparse Vector

Sparse vectors represent words or phrases using vector embeddings where most elements are zero, with only one non-zero element indicating the presence of a specific word. Sparse vector models, such as [SPLADEv2](https://arxiv.org/abs/2109.10086), outperform dense models in out-of-domain knowledge search, keyword-awareness, and interpretability. They are particularly useful in information retrieval, natural language processing, and recommendation systems, where combining sparse vectors for recall with a large model for ranking can significantly improve retrieval results.

In Zilliz Cloud, the use of sparse vectors follows a similar workflow to that of dense vectors. It involves creating a collection with a sparse vector column, inserting data, creating an index, and conducting similarity searches and scalar queries.

In this tutorial, you will learn how to:

- Prepare sparse vector embeddings;

- Create a collection with a sparse vector field;

- Insert entities with sparse vector embeddings;

- Index the collection and perform ANN search on sparse vectors.

To see sparse vectors in action, refer  to [hello_sparse](https://github.com/milvus-io/pymilvus/blob/master/examples/milvus_client/sparse.py).

<Admonition type="info" icon="📘" title="Notes">

<p></p>
<p></p>
<p>Currently, this feature is available exclusively for clusters that have been upgraded to the Beta version.</p>
<p></p>

</Admonition>

## Prepare sparse vector embeddings{#prepare-sparse-vector-embeddings}

To use sparse vectors in Zilliz Cloud, prepare vector embeddings in one of the supported formats:

- **Sparse Matrices**: Utilize the [scipy.sparse](https://docs.scipy.org/doc/scipy/reference/sparse.html#module-scipy.sparse) class family to represent your sparse embeddings. This method is efficient for handling large-scale, high-dimensional data.

- **List of Dictionaries**: Represent each sparse embedding as a dictionary, structured as `{dimension_index: value, ...}`, where each key-value pair represents the dimension index and its corresponding value.

    Example:

    ```python
    {2: 0.33, 98: 0.72, ...}
    ```

- **List of Iterables of Tuples**: Similar to the list of dictionaries, but use an iterable of tuples, `(dimension_index, value)]`, to specify only the non-zero dimensions and their values.

    Example:

    ```python
    [(2, 0.33), (98, 0.72), ...]
    ```

The following example prepares sparse embeddings by generating a random sparse matrix for 10,000 entities, each with 10,000 dimensions and a sparsity density of 0.005.

```python
# Prepare entities with sparse vector representation
import numpy as np
import random

rng = np.random.default_rng()

num_entities, dim = 10000, 10000

# Generate random sparse rows with an average of 25 non-zero elements per row
entities = [
    {
        "scalar_field": rng.random(),
        # To represent a single sparse vector row, you can use:
        # - Any of the scipy.sparse sparse matrices class family with shape[0] == 1
        # - Dict[int, float]
        # - Iterable[Tuple[int, float]]
        "sparse_vector": {
            d: rng.random() for d in random.sample(range(dim), random.randint(20, 30))
        },
    }
    for _ in range(num_entities)
]

# print the first entity to check the representation
print(entities[0])

# Output:
# {
#     'scalar_field': 0.520821523849214,
#     'sparse_vector': {
#         5263: 0.2639375518635271,
#         3573: 0.34701499565746674,
#         9637: 0.30856525997853057,
#         4399: 0.19771651149001523,
#         6959: 0.31025067641541815,
#         1729: 0.8265339135915016,
#         1220: 0.15303302147479103,
#         7335: 0.9436728846033107,
#         6167: 0.19929870545596562,
#         5891: 0.8214617920371853,
#         2245: 0.7852255053773395,
#         2886: 0.8787982039149889,
#         8966: 0.9000606703940665,
#         4910: 0.3001170013981104,
#         17: 0.00875671667413136,
#         3279: 0.7003425473001098,
#         2622: 0.7571360018373428,
#         4962: 0.3901879090102064,
#         4698: 0.22589525720196246,
#         3290: 0.5510228492587324,
#         6185: 0.4508413201390492
#     }
# }
```

<Admonition type="info" icon="📘" title="Notes">

<p>The vector dimensions must be of Python <code>int</code> or <code>numpy.integer</code> type, and the values must be of Python <code>float</code> or <code>numpy.floating</code> type.</p>

</Admonition>

## Create a collection with a sparse vector field{#create-a-collection-with-a-sparse-vector-field}

To create a collection with a sparse vector field in Zilliz Cloud, set the **datatype** of the sparse vector field to **DataType.SPARSE_FLOAT_VECTOR**. Unlike dense vectors, there is no need to specify a dimension for sparse vectors.

```python
CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token

from pymilvus import MilvusClient, DataType

# Create a MilvusClient instance
client = MilvusClient(uri=CLUSTER_ENDPOINT, token=API_KEY)

# Create a collection with a sparse vector field
schema = client.create_schema(
    auto_id=True,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="pk", datatype=DataType.VARCHAR, is_primary=True, max_length=100)
schema.add_field(field_name="scalar_field", datatype=DataType.DOUBLE)
# For sparse vector, no need to specify dimension
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)

client.create_collection(collection_name="test_sparse_vector", schema=schema)
```

For details on common collection parameters, refer to [create_collection()](/reference/python/python/Collections-create_collection).

## Insert entities with sparse vector embeddings{#insert-entities-with-sparse-vector-embeddings}

To insert entities with sparse vector embeddings, simply pass the list of entities to the [insert()](/reference/python/python/Vector-insert) method.

```python
# Insert entities
client.insert(collection_name="test_sparse_vector", data=entities)
```

## Index the collection{#index-the-collection}

Before performing similarity searches, create an index for the collection. For more information on index types and parameters, refer to [add_index()](/reference/python/python/Management-add_index) and [create_index()](/reference/python/python/Management-create_index).

```python
# Index the collection# Prepare index params
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_inverted_index",
    index_type="AUTOINDEX",
    metric_type="IP", # the metric type to be used for the index. Currently, only `IP` (Inner Product) is supported.
    params={"drop_ratio_build": 0.2}, # the ratio of small vector values to be dropped during indexing.
)

# Create index
client.create_index(collection_name="test_sparse_vector", index_params=index_params)
```

For index building on sparse vectors, take note of the following:

- `index_type`: The type of index to be built. The `AUTOINDEX` option frees you from tuning and tweaking index parameters. To learn more about `AUTOINDEX`, refer to [AUTOINDEX Explained](./autoindex-explained). 

- `metric_type`: Only `IP` (Inner Product) distance metric is supported for sparse vectors.

- `params.drop_ratio_build`: The index parameter used specifically for sparse vectors. It controls the proportion of small vector values that are excluded during the indexing process. This parameter enables fine-tuning of the trade-off between efficiency and accuracy by disregarding small values when constructing the index. For instance, if `drop_ratio_build = 0.3`, during the index construction, all values from all sparse vectors are gathered and sorted. The smallest 30% of these values are not included in the index, thereby reducing the computational workload during search.

## Perform ANN search{#perform-ann-search}

After the collection is indexed and loaded into memory, use the [search()](/reference/python/python/Vector-search) method to retrieve the relevant documents based on the query.

```python
# Load the collection into memory
client.load_collection(collection_name="test_sparse_vector")

# Perform ANN search on sparse vectors

# for demo purpose we search for the last inserted vector
query_vector = entities[-1]["sparse_vector"]

search_params = {
    "metric_type": "IP",
    "params": {"drop_ratio_search": 0.2}, # the ratio of small vector values to be dropped during search.
}

search_res = client.search(
    collection_name="test_sparse_vector",
    data=[query_vector],
    limit=3,
    output_fields=["pk", "scalar_field"],
    search_params=search_params,
)

for hits in search_res:
    for hit in hits:
        print(f"hit: {hit}")
        
# Output:
# hit: {'id': '450273575275875686', 'distance': 7.750614643096924, 'entity': {'pk': '450273575275875686', 'scalar_field': 0.4480435927174723}}
# hit: {'id': '450273575275870571', 'distance': 1.1165071725845337, 'entity': {'pk': '450273575275870571', 'scalar_field': 0.4279938814482982}}
# hit: {'id': '450273575275870064', 'distance': 0.9200878739356995, 'entity': {'pk': '450273575275870064', 'scalar_field': 0.4212978190243173}}
```

When configuring search parameters, take note of the following:

- `params.drop_ratio_search`: The search parameter used specifically for sparse vectors. This option allows fine-tuning of the search process by specifying the ratio of the smallest values in the query vector to ignore. It helps balance search precision and performance. The smaller the value set for `drop_ratio_search`, the less these small values contribute to the final score. By ignoring some small values, search performance can be improved with minimal impact on accuracy.

## Perform scalar queries{#perform-scalar-queries}

In addition to ANN search, Zilliz Cloud also supports scalar queries on sparse vectors. These queries allow you to retrieve documents based on a scalar value associated with the sparse vector. For more information on parameters, refer to [query()](/reference/python/python/Vector-query).

Filter entities with **scalar_field** greater than 0.999:

```python
# Perform a query by specifying filter expr
filter_query_res = client.query(
    collection_name="test_sparse_vector",
    filter="scalar_field > 0.999",
)

print(filter_query_res[:2])

# Output:
# [{'pk': '450273575275867462', 'scalar_field': 0.999706489772776, 'sparse_vector': {651: 0.6896481513977051, 884: 0.037571314722299576, 1930: 0.11125790327787399, 2013: 0.9335554242134094, 2128: 0.10234206169843674, 2271: 0.17880432307720184, 2642: 0.7378848791122437, 3080: 0.3128625154495239, 4322: 0.18627822399139404, 4891: 0.24622178077697754, 4956: 0.5002409815788269, 5022: 0.008009751327335835, 5428: 0.7347196936607361, 5852: 0.5609562993049622, 6408: 0.6986650228500366, 6605: 0.5112012028694153, 6625: 0.09636110812425613, 6650: 0.18540434539318085, 7512: 0.969779908657074, 8328: 0.46709105372428894, 8822: 0.1417122334241867, 9142: 0.7508372068405151}}, {'pk': '450273575275867634', 'scalar_field': 0.9992726390858346, 'sparse_vector': {553: 0.3291417956352234, 922: 0.6224955916404724, 1266: 0.2872304320335388, 2287: 0.34055230021476746, 2668: 0.28824421763420105, 3759: 0.7466465830802917, 4037: 0.4526124596595764, 4237: 0.5066826939582825, 5285: 0.8228104114532471, 5509: 0.11998588591814041, 5733: 0.12240607291460037, 5765: 0.4611184298992157, 6236: 0.8464925289154053, 7400: 0.6218372583389282, 7533: 0.8130961656570435, 7775: 0.04926314577460289, 7905: 0.9843814969062805, 8389: 0.0985478013753891, 8689: 0.6625003218650818, 8889: 0.14608529210090637, 8951: 0.5812358260154724, 9457: 0.36155056953430176}}]
```

Filter entities by primary key:

```python
# primary keys of entities that satisfy the filter
pks = [ret["pk"] for ret in filter_query_res]

# Perform a query by primary key
pk_query_res = client.query(
    collection_name="test_sparse_vector", filter=f"pk == '{pks[0]}'"
)

print(pk_query_res)

# Output:
# data: ["{'scalar_field': 0.999706489772776, 'sparse_vector': {651: 0.6896481513977051, 884: 0.037571314722299576, 1930: 0.11125790327787399, 2013: 0.9335554242134094, 2128: 0.10234206169843674, 2271: 0.17880432307720184, 2642: 0.7378848791122437, 3080: 0.3128625154495239, 4322: 0.18627822399139404, 4891: 0.24622178077697754, 4956: 0.5002409815788269, 5022: 0.008009751327335835, 5428: 0.7347196936607361, 5852: 0.5609562993049622, 6408: 0.6986650228500366, 6605: 0.5112012028694153, 6625: 0.09636110812425613, 6650: 0.18540434539318085, 7512: 0.969779908657074, 8328: 0.46709105372428894, 8822: 0.1417122334241867, 9142: 0.7508372068405151}, 'pk': '450273575275867462'}"] , extra_info: {'cost': 6}
```

## Limits{#limits}

When using sparse vectors in Zilliz Cloud, consider the following limits:

- Currently, only the **IP** distance metric is supported for sparse vectors.

- Currently, [range search](./single-vector-search#range-search), [grouping search](./single-vector-search#grouping-search-beta), and [search iterator](./with-iterators) are not supported for sparse vectors.

## FAQ{#faq}

- **What distance metric is supported for sparse vectors?**

    Sparse vectors only support the Inner Product (IP) distance metric due to the high dimensionality of sparse vectors, which makes L2 distance and cosine distance impractical.

- **How should I choose the drop_ratio_build and drop_ratio_search parameters?**

    The choice of **drop_ratio_build** and **drop_ratio_search** depends on the characteristics of your data and your requirements for search latency/throughput and accuracy.

- **What data types are supported for sparse embeddings?**

    The dimension part must be an unsigned 32-bit integer, and the value part can be a non-negative 32-bit floating-point number.

- **Can the dimension of a sparse embedding be any discrete value within the uint32 space?**

    Yes, with one exception. The dimension of a sparse embedding can be any value in the range of `[0, maximum of uint32)`. This means you cannot use the maximum value of uint32.

- **Are searches on growing segments conducted through an index or by brute force?**

    Searches on growing segments are conducted through an index of the same type as the sealed segment index. For new growing segments before the index is built, a brute force search is used.

- **Is it possible to have both sparse and dense vectors in a single collection?**

    Yes, with multiple vector type support, you can create collections with both sparse and dense vector columns and perform hybrid searches on them.

- **What are the requirements for sparse embeddings to be inserted or searched?**

    Sparse embeddings must have at least one non-zero value, and vector indices must be non-negative.

