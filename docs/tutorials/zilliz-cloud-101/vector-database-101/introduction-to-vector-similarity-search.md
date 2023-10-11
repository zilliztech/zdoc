---
slug: /introduction-to-vector-similarity-search
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Introduction to Vector Similarity Search

Hey there - welcome back to Vector Database 101.

In the previous tutorials, we took a look at [unstructured data](./introduction-to-unstructured-data), [vector databases](./what-is-a-vector-database), and [Milvus](https://milvus.io) - the world's most popular open-source vector database. We also briefly touched upon the idea of *embeddings*, high-dimensional vectors which serve as awesome semantic representations of unstructured data. One key note to remember - embeddings that are "close" to one another represent semantically similar pieces of data.

In this tutorial, we'll build on that knowledge by going over a word embedding example and seeing how semantically similar pieces of unstructured data are "near" one another while dissimilar pieces of unstructured data are "far" from one another. This will lead to a high-level overview of *nearest neighbor search*, a computing problem that involves finding the closest vector(s) to a query vector based on a unified *distance metric*. We'll go over some well-known methods for nearest neighbor search (including my favorite - ANNOY) in addition to commonly used *distance metrics*.

Let's dive in.

## **Comparing embeddings**{#comparing-embeddings}

Let's go through a couple of word embedding examples. For the sake of simplicity, we'll use `word2vec`, an old model which uses a training methodology based on *skipgrams*. BERT and other modern transformer-based models will be able to provide you with more contextualized word embeddings, but we'll stick with `word2vec` for simplicity. Jay Alammar provides a [great tutorial on ](https://jalammar.github.io/illustrated-word2vec/)`word2vec`, if you're interested in learning a bit more.

### **Some prep work**{#some-prep-work}

Before beginning, we'll need to install the `gensim` library and load a `word2vec` model.

```bash
pip install gensim --disable-pip-version-check
wget <https://s3.amazonaws.com/dl4j-distribution/GoogleNews-vectors-negative300.bin.gz>
gunzip GoogleNews-vectors-negative300.bin
```

```plaintext
Requirement already satisfied: gensim in /Users/fzliu/.pyenv/lib/python3.8/site-packages (4.1.2)
Requirement already satisfied: smart-open>=1.8.1 in /Users/fzliu/.pyenv/lib/python3.8/site-packages (from gensim) (5.2.1)
Requirement already satisfied: numpy>=1.17.0 in /Users/fzliu/.pyenv/lib/python3.8/site-packages (from gensim) (1.19.5)
Requirement already satisfied: scipy>=0.18.1 in /Users/fzliu/.pyenv/lib/python3.8/site-packages (from gensim) (1.7.3)
--2022-02-22 00:30:34--  <https://s3.amazonaws.com/dl4j-distribution/GoogleNews-vectors-negative300.bin.gz>
Resolving s3.amazonaws.com (s3.amazonaws.com)... 52.216.20.165
Connecting to s3.amazonaws.com (s3.amazonaws.com)|52.216.20.165|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1647046227 (1.5G) [application/x-gzip]
Saving to: GoogleNews-vectors-negative300.bin.gz

GoogleNews-vectors- 100%[===================>]   1.53G  2.66MB/s    in 11m 23s

2022-02-22 00:41:57 (2.30 MB/s) - GoogleNews-vectors-negative300.bin.gz saved [1647046227/1647046227]

gunzip: GoogleNews-vectors-negative300.bin: unknown suffix -- ignored
```

Now that we've done all the prep work required to generate word-to-vector embeddings, let's load the trained `word2vec` model.

```python
from gensim.models import KeyedVectors
model = KeyedVectors.load_word2vec_format('GoogleNews-vectors-negative300.bin', binary=True)
```

### **Example 0: Marlon Brando**{#example-0-marlon-brando}

Let's take a look at how `word2vec` interprets the famous actor Marlon Brando.

```python
print(model.most_similar(positive=['Marlon_Brando']))
```

```plaintext
[('Brando', 0.757453978061676), ('Humphrey_Bogart', 0.6143958568572998), ('actor_Marlon_Brando', 0.6016287207603455), ('Al_Pacino', 0.5675410032272339), ('Elia_Kazan', 0.5594002604484558), ('Steve_McQueen', 0.5539456605911255), ('Marilyn_Monroe', 0.5512186884880066), ('Jack_Nicholson', 0.5440199375152588), ('Shelley_Winters', 0.5432392954826355), ('Apocalypse_Now', 0.5306933522224426)]
```

Marlon Brando worked with Al Pacino in The Godfather and Elia Kazan in A Streetcar Named Desire. He also starred in Apocalypse Now.

### **Example 1: If all of the kings had their queens on the throne**{#example-1-if-all-of-the-kings-had-their-queens-on-the-throne}

Vectors can be added and subtracted from each other to demo underlying semantic changes.

```python
print(model.most_similar(positive=['king', 'woman'], negative=['man'], topn=1))
```

```plaintext
[('queen', 0.7118193507194519)]
```

Who says engineers can't enjoy a bit of dance-pop now and then?

### **Example 2: Apple, the company, the fruit, ... or both?**{#example-2-apple-the-company-the-fruit-or-both}

The word "apple" can refer to both the company as well as the delicious red fruit. In this example, we can see that Word2Vec retains both meanings.

```python
print(model.most_similar(positive=['samsung', 'iphone'], negative=['apple'], topn=1))
print(model.most_similar(positive=['fruit'], topn=10)[9:])
```

```plaintext
[('droid_x', 0.6324754953384399)]
[('apple', 0.6410146951675415)]
```

"Droid" refers to Samsung's first 4G LTE smartphone ("Samsung" + "iPhone" - "Apple" = "Droid"), while "apple" is the 10th closest word to "fruit".

## **Vector search strategies**{#vector-search-strategies}

Now that we've seen the power of embeddings, let's briefly take a look at some of the ways we can conduct a nearest-neighbor search. This is not a comprehensive list; we'll just briefly go over some common methods in order to provide a high-level overview of how vector search is conducted at scale. Note that some of these methods are not exclusive to each other - it's possible, for example, to use quantization in conjunction with space partitioning.

(We'll also be going over each of these methods in detail in future tutorials, so stay tuned for more.)

### **Linear search**{#linear-search}

The simplest but most naïve nearest neighbor search algorithm is good old linear search: computing the distance from a query vector to all other vectors in the vector database.

For obvious reasons, naïve search does not work when trying to scale our vector database to tens or hundreds of millions of vectors. But when the total number of elements in the database is small, this can actually be the most efficient way to perform vector search since a separate data structure for the index is not required, while inserts and deletes can be implemented fairly easily.

Due to the lack of space complexity as well as constant space overhead associated with naïve search, this method can often outperform space partitioning even when querying across a moderate number of vectors.

### **Space partitioning**{#space-partitioning}

Space partitioning is not a single algorithm, but rather a family of algorithms that all use the same concept.

K-dimensional trees (kd-trees) are perhaps the most well-known in this family, and work by continuously bisecting the search space (splitting the vectors into “left” and “right” buckets) in a manner similar to binary search trees.

Inverted file index (IVF) is also a form of space partitioning, and works by assigning each vector to its nearest centroid - searches are then conducted by first determining the query vector's closest centroid and conducting the search around there, significantly reducing the total number of vectors that need to be searched. IVF is a fairly popular indexing strategy and is commonly combined with other indexing algorithms to improve performance.

### **Quantization**{#quantization}

Quantization is a technique for reducing the total size of the database by reducing the precision of the vectors.

Scalar quantization (SQ), for example, works by multiplying high-precision floating point vectors with a scalar value, then casting the elements of the resultant vector to their nearest integers. This not only reduces the effective size of the entire database (e.g. by a factor of eight for conversion from `float64_t` to `int8_t`), but also has the positive side-effect of speeding up vector-to-vector distance computations.

Product quantization (PQ) is another quantization technique that works similar to dictionary compression. In PQ, all vectors are split into equally-sized subvectors, and each subvector is then replaced with a centroid.

### **Hierarchical Navigable Small Worlds (HNSW)**{#hierarchical-navigable-small-worlds-hnsw}

Hierarchical Navigable Small Worlds is a graph-based indexing and retrieval algorithm.

This works differently from product quantization: instead of improving the searchability of the database by reducing its effective size, HNSW creates a multi-layer graph from the original data. Upper layers contain only "long connections" while lower layers contain only "short connections" between vectors in the database (see the next section for an overview of vector distance metrics). Individual graph connections are created a-la skip lists.

With this architecture in place, searching becomes fairly straightforward – we greedily traverse the uppermost graph (the one with the longest inter-vector connections) for the vector closest to our query vector. We then do the same for the second layer, using the result of the first layer search as the starting point. This continues until we complete the search at the bottommost layer, the result of which becomes the nearest neighbor of the query vector.

![GRHcbYtK6oK33OxeR1IcTqqRnCe](/img/GRHcbYtK6oK33OxeR1IcTqqRnCe.png)

### **Approximate Nearest Neighbors Oh Yeah**{#approximate-nearest-neighbors-oh-yeah}

This is probably my favorite ANN algorithm simply due to its playful and unintunitive name. [Approximate Nearest Neighbors Oh Yeah](https://github.com/spotify/annoy) (ANNOY) is a tree-based algorithm popularized by Spotify (it’s used in their music recommendation system). Despite the strange name, the underlying concept behind ANNOY is actually fairly simple – binary trees.

ANNOY works by first randomly selecting two vectors in the database and bisecting the search space along the hyperplane separating those two vectors. This is done iteratively until there are fewer than some predefined parameter `NUM_MAX_ELEMS` per node. Since the resulting index is essentially a binary tree, this allows us to do our search on O(log n) complexity.

![ZPEtb6rV6o6tjVxYD1JceY60n1c](/img/ZPEtb6rV6o6tjVxYD1JceY60n1c.png)

## **Commonly used similarity metrics**{#commonly-used-similarity-metrics}

The very best vector databases are useless without similarity metrics – methods for computing the distance between two vectors. Numerous metrics exist, so we will discuss only the most commonly used subset here.

### **Floating point vector similarity metrics**{#floating-point-vector-similarity-metrics}

The most common floating point vector similarity metrics are, in no particular order, *L1 distance*, *L2 distance*, and *cosine similarity*. The first two values are *distance metrics* (lower values imply more similarity while higher values imply lower similarity), while cosine similarity is a *similarity metric* (higher values imply more similarity).

L1 distance is also commonly referred to as Manhattan distance, aptly named after the fact that getting from point A to point B in Manhattan requires moving along one of two perpendicular directions. The second equation, L2 distance, is simply the distance between two vectors in Euclidean space. The third and final equation is cosine distance, equivalent to the cosine of the angle between two vectors. Note the equation for cosine similarity works out to be the dot product between normalized versions of input vectors **a** and **b**.

With a bit of math, we can also show that L2 distance and cosine similarity are effectively equivalent when it comes to similarity ranking for unit norm vectors:

Recall that unit norm vectors have a magnitude of 1:

With this, we get:

Since we have unit norm vectors, cosine distance works out to be the dot product between **a** and **b** (the denominator in equation 3 above works out to be 1):

Essentially, for unit norm vectors, L2 distance and cosine similarity are functionally equivalent! Always remember to normalize your embeddings.

### **Binary vector similarity metrics**{#binary-vector-similarity-metrics}

Binary vectors, as their name suggests, do not have metrics based in arithmetics a-la floating point vectors. Similarity metrics for binary vectors instead rely on either set mathematics, bit manipulation, or a combination of both (it's okay, I also hate discrete math). Here are the formulas for two commonly used binary vector similarity metrics:

The first equation is called Tanimoto/Jaccard distance and is essentially a measure of the amount of overlap between two binary vectors. The second equation is Hamming distance and is a count of the number of vector elements in a and b which differ from each other.

You can most likely safely ignore these similarity metrics since the majority of applications use cosine similarity over floating point embeddings.

## **Wrapping up**{#wrapping-up}

In this tutorial, we took a look at vector similarity search, along with some common vector search algorithms and distance metrics. Here are some key takeaways:

- Embedding vectors are powerful representations, both in terms of distance between the vectors and in terms of vector arithmetic. By applying a liberal quantity of vector algebra to embeddings, we can perform scalable semantic analysis using just basic mathematical operators.

- There are a wide variety of approximate nearest neighbor search algorithms and/or index types to choose from. The most commonly one used today is HNSW, but a different indexing algorithm may work better for your particular application, depending on the total number of embeddings you have in addition to the length of each individual vector.

- The two primary distance metrics used today are L2/Euclidean distance and cosine distance. These two metrics, when used on normalized embeddings, are functionally equivalent.

Thanks for joining us for this tutorial! Vector search is a core part of Milvus, and it will continue to be In future tutorials, we'll be doing some deeper dives into the most commonly used ANNS algorithms - HNSW and ScaNN.

Hope you enjoyed this post - follow us on [Twitter](https://twitter.com/zilliz_universe) and [LinkedIn](https://www.linkedin.com/company/zilliz/) for more content!

## Related topics{#related-topics}

- [Vector Index Basics and the Inverted File Index](./vector-index-basics-and-the-inverted-file-index) 

- [Scalar Quantization and Product Quantization](./scalar-quantization-and-product-quantization) 

- [Hierarchical Navigable Small World (HNSW)](./hierarchical-navigable-small-world-hnsw) 
