---
title: "Binary Vector | Cloud"
slug: /use-binary-vector
sidebar_label: "Binary Vector"
beta: FALSE
notebook: FALSE
description: "Binary vectors are a special form of data representation that convert traditional high-dimensional floating-point vectors into binary vectors containing only 0s and 1s. This transformation not only compresses the size of the vector but also reduces storage and computational costs while retaining semantic information. When precision for non-critical features is not essential, binary vectors can effectively maintain most of the integrity and utility of the original floating-point vectors. | Cloud"
type: origin
token: NTwawtvYdiXTkukbss7ccw2RnXc
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - binary vector

---

import Admonition from '@theme/Admonition';


# Binary Vector

Binary vectors are a special form of data representation that convert traditional high-dimensional floating-point vectors into binary vectors containing only 0s and 1s. This transformation not only compresses the size of the vector but also reduces storage and computational costs while retaining semantic information. When precision for non-critical features is not essential, binary vectors can effectively maintain most of the integrity and utility of the original floating-point vectors.

Binary vectors have a wide range of applications, particularly in situations where computational efficiency and storage optimization are crucial. In large-scale AI systems, such as search engines or recommendation systems, real-time processing of massive amounts of data is key. By reducing the size of the vectors, binary vectors help lower latency and computational costs without significantly sacrificing accuracy. Additionally, binary vectors are useful in resource-constrained environments, such as mobile devices and embedded systems, where memory and processing power are limited. Through the use of binary vectors, complex AI functions can be implemented in these restricted settings while maintaining high performance.

## Overview{#overview}

Binary vectors are a method of encoding complex objects (like images, text, or audio) into fixed-length binary values. In Milvus, binary vectors are typically represented as bit arrays or byte arrays. For example, an 8-dimensional binary vector can be represented as `[1, 0, 1, 1, 0, 0, 1, 0]`.

The diagram below shows how binary vectors represent the presence of keywords in text content. In this example, a 10-dimensional binary vector is used to represent two different texts (**Text 1** and **Text 2**), where each dimension corresponds to a word in the vocabulary: 1 indicates the presence of the word in the text, while 0 indicates its absence.

![TuIGwtyEkh9g04bvo0icsWdynBd](/img/TuIGwtyEkh9g04bvo0icsWdynBd.png)

Binary vectors have the following characteristics:

- **Efficient Storage:** Each dimension requires only 1 bit of storage, significantly reducing storage space.

- **Fast Computation:** Similarity between vectors can be quickly calculated using bitwise operations like XOR.

- **Fixed Length:** The length of the vector remains constant regardless of the original text length, making indexing and retrieval easier.

- **Simple and Intuitive:** Directly reflects the presence of keywords, making it suitable for certain specialized retrieval tasks.

Binary vectors can be generated through various methods. In text processing, predefined vocabularies can be used to set corresponding bits based on word presence. For image processing, perceptual hashing algorithms (like [pHash](https://en.wikipedia.org/wiki/Perceptual_hashing)) can generate binary features of images. In machine learning applications, model outputs can be binarized to obtain binary vector representations.

After binary vectorization, the data can be stored in Milvus for management and vector retrieval. The diagram below shows the basic process.

![TF1uw4AQVhFdmBbrhyVcJO6WnXe](/img/TF1uw4AQVhFdmBbrhyVcJO6WnXe.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Although binary vectors excel in specific scenarios, they have limitations in their expressive capability, making it difficult to capture complex semantic relationships. Therefore, in real-world scenarios, binary vectors are often used alongside other vector types to balance efficiency and expressiveness. For more information, refer to <a href="./use-dense-vector">Dense Vector</a> and <a href="./use-sparse-vector">Sparse Vector</a>.</p>

</Admonition>

## Use binary vectors in Milvus{#use-binary-vectors-in-milvus}

### Add vector field{#add-vector-field}

To use binary vectors in Milvus, first define a vector field for storing binary vectors when creating a collection. This process includes:

1. Setting `datatype` to the supported binary vector data type, i.e., `BINARY_VECTOR`.

1. Specifying the vector's dimensions using the `dim` parameter. Note that `dim` must be a multiple of 8 as binary vectors must be converted into a byte array when inserting. Every 8 boolean values (0 or 1) will be packed into 1 byte. For example, if `dim=128`, a 16-byte array is required for insertion.

[Unsupported block type]

In this example, a vector field named `binary_vector` is added for storing binary vectors. The data type of this field is `BINARY_VECTOR`, with a dimension of 128.

### Set index params for vector field{#set-index-params-for-vector-field}

To speed up searches, an index must be created for the binary vector field. Indexing can significantly enhance the retrieval efficiency of large-scale vector data.

[Unsupported block type]

In the example above, an index named `binary_vector_index` is created for the `binary_vector` field, using the `BIN_IVF_FLAT` index type. The `metric_type` is set to `HAMMING`, indicating that Hamming distance is used for similarity measurement.

Besides `BIN_IVF_FLAT`, Milvus supports other index types for binary vectors. For more details, refer to xx. Additionally, Milvus supports other similarity metrics for binary vectors. For more information, refer to [Metric Types](./search-metrics-explained).

### Create collection{#create-collection}

Once the binary vector and index settings are complete, create a collection that contains binary vectors. The example below uses the `create_collection` method to create a collection named `my_binary_collection`.

[Unsupported block type]

### Insert data{#insert-data}

After creating the collection, use the `insert` method to add data containing binary vectors. Note that binary vectors should be provided in the form of a byte array, where each byte represents 8 boolean values.

For example, for a 128-dimensional binary vector, a 16-byte array is required (since 128 bits ÷ 8 bits/byte = 16 bytes). Below is an example code for inserting data:

[Unsupported block type]

### Perform similarity search{#perform-similarity-search}

Similarity search is one of the core features of Milvus, allowing you to quickly find data that is most similar to a query vector based on the distance between vectors. To perform a similarity search using binary vectors, prepare the query vector and search parameters, then call the `search` method.

During search operations, binary vectors must also be provided in the form of a byte array. Ensure that the dimensionality of the query vector matches the dimension specified when defining `dim` and that every 8 boolean values are converted into 1 byte.

[Unsupported block type]

For more information on similarity search parameters, refer to [Basic ANN Search](./single-vector-search).

