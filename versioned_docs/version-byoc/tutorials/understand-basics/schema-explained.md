---
slug: /schema-explained
beta: FALSE
notebook: FALSE
type: origin
token: TqMFwNyDbiY9qekBfPNcbpuvnib
sidebar_position: 3

---

import Admonition from '@theme/Admonition';


# Schema Explained

Defining a data schema is the process of creating a clear and organized data structure for storing information in a cluster. A data schema also illustrates how the data is connected. The objective of a data schema is to recognize all the data components in a dataset, demonstrate how they are linked, and determine the most effective ways to represent these relationships.

## Defining a data schema{#defining-a-data-schema}

In a Zilliz Cloud cluster, collections may have schemas that represent different data structures. It's essential to define the data schema properly to represent the structure of your dataset. To define a data schema, you need to consider the following components:

- **Entity**

    An entity in a collection is similar to a row in a tabular database. Each property of an entity corresponds to a column in that tabular database. When determining the dataset to be inserted into a collection, identify the entities and the properties that are shared among them.

    For example, a book can be an entity in a collection, and its properties can include title, author, ISBN, and language.

- **Data types**

    Each property of an entity has its own data type. Set an appropriate data type to define a property.

    For instance, the data type for title should be **VarChar**.

- **Constraints on entity property values**

    Different data types may have their own constraints. For example, a vector field has a constraint on the number of dimensions, and a VarChar field has a constraint on the maximum number of characters.

The data schema for a collection is sometimes time-consuming, especially when there are many properties to define. Zilliz Cloud clusters support both dynamic and fixed data fields to facilitate the process.

### Dynamic data fields{#dynamic-data-fields}

A collection can have one primary key field and one vector field. If you enable the dynamic field, you do not have to define the collection schema beforehand. All you have to do is provide a name for the collection and the number of dimensions for the vector field. Zilliz Cloud will then determine which fields and their values should be saved as key-value pairs in a reserved field called **$meta** upon data insertions.

For example, the following code snippet creates a collection named **medium_articles** without providing the collection with a fixed schema.

```python
# Connect using a MilvusClient object
from pymilvus import MilvusClient

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token

# Initialize a MilvusClient instance
# Replace uri and token with your own
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # Cluster endpoint obtained from the console
    token=TOKEN # a colon-separated cluster username and password
)

# Create a collection
client.create_collection(
    collection_name="medium_articles",
    dimension=768 # The dimension should be an integer greater than 1
)
```

When you insert an entity into the collection, Zilliz Cloud will parse the data and save the non-schema-defined fields as key-value pairs in the reserved field named **$meta**.

```python
client.insert(
    collection_name="medium_articles",
    data: {
        "id": 0,
        "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
        "vector": [0.041732933, 0.013779674, ...., -0.013061441],
        "link": "<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>",
        "reading_time": 13,
        "publication": "The Startup",
        "claps": 1100,
        "responses": 18
    }
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>Enabling the dynamic field can be helpful when you need to handle schema change requests. It's recommended that you enable it while creating a collection as it proves to be useful in most cases. </p>
<p>However, there are two scenarios where you might want to avoid using the dynamic field.</p>
<ul>
<li><p>If the field keys in your dataset contain special characters like <strong>$</strong> or escape characters.</p></li>
<li><p>If you are focused on achieving extreme filtering performance.</p></li>
</ul>

</Admonition>

### Fixed data fields{#fixed-data-fields}

Representing your data using fixed data fields is a reliable way to keep your data clean and achieve search results that meet your expectations. While the process of fixed data fields may take time, making changes to it is simple. We highly recommend utilizing fixed data fields for your dataset.

To create a collection schema using the above data fields, you can do as follows:

```python
from pymilvus import FieldSchema, CollectionSchema, DataType, Collection

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="reading_time", dtype=DataType.INT64),
    FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="claps", dtype=DataType.INT64),
    FieldSchema(name="responses", dtype=DataType.INT64)
]

# Build the schema
schema = CollectionSchema(
    fields,
    description="Schema of Medium articles"
)

collection = Collection(
    name="medium_articles", 
    description="Medium articles published between Jan and August in 2020 in prominent publications",
    schema=schema
)
```

## Data types{#data-types}

Zilliz Cloud supports the following field data types. The available data types vary depending on the field type.

- **Primary key field**

    - 64-bit integer (INT64)

    - Variable character (VARCHAR)

- **Scalar field**

    - 64-bit integer (INT64)

    - Variable character (VARCHAR)

    - 8-bit integer (INT8)

    - 16-bit integer (INT16)

    - 32-bit integer (INT32)

    - 4-byte floating-point (FLOAT)

    - 8-byte floating-point (DOUBLE)

    - Boolean value (BOOLEAN)

    - [JSON](./enable-dynamic-field)

    - [ARRAY](./use-array-fields)

- **Vector field**

    - FLOAT_VECTOR: Stores 32-bit floating-point numbers, commonly used in scientific computing and machine learning for representing real numbers.

    - FLOAT16_VECTOR <sup>(Beta)</sup>: Stores 16-bit half-precision floating-point numbers, used in deep learning and GPU computations for memory and bandwidth efficiency.

    - BFLOAT16_VECTOR <sup>(Beta)</sup>: Stores 16-bit floating-point numbers with reduced precision but the same exponent range as Float32, popular in deep learning for reducing memory and computational requirements without significantly impacting accuracy.

    - SPARSE_FLOAT_VECTOR <sup>(Beta)</sup>: Stores a list of non-zero elements and their corresponding indices, used for representing sparse vectors. When using `SPARSE_FLOAT_VECTOR`, you do not need to specify the dimension.

    - BINARY_VECTOR <sup>(Beta)</sup>: Stores binary data as a sequence of 0s and 1s, used for compact feature representation in image processing and information retrieval. When using `BINARY_VECTOR`, note that the dimension must be a multiple of 8, ranging from 8 to 32,768 * 8.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, the vector field types <code>FLOAT16_VECTOR</code>, <code>BFLOAT16_VECTOR</code>, <code>SPARSE_FLOAT_VECTOR</code>, and <code>BINARY_VECTOR</code> are available exclusively for Dedicated clusters that have been upgraded to the Beta version.</p>

    </Admonition>

## What’s next{#whats-next}

- [Manage Collections](./manage-collections)

- [Enable Dynamic Field](./enable-dynamic-field)

