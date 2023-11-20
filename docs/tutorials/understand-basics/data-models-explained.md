---
slug: /docs/data-models-explained
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Schema Explained

Data modeling is the process of creating a clear and organized data model for storing information in a database. Data models also illustrate how the data is connected. The objective of data modeling is to recognize all the data components in a dataset, demonstrate how they are linked, and determine the most effective ways to represent these relationships.

## Defining data models{#defining-data-models}

In a Zilliz Cloud cluster, collections may have schemas that represent different data models. It's essential to define the data models properly to represent the structure of your dataset. To define a data model, you need to consider the following components:

- **Entity**
    An entity in a collection is similar to a row in a tabular database. Each property of an entity corresponds to a column in that tabular database. When determining the dataset to be inserted into a collection, identify the entities and the properties that are shared among them.

    For example, a book can be an entity in a collection, and its properties can include title, author, ISBN, and language.

- **Data types**
    Each property of an entity has its own data type. Set an appropriate data type to define a property.

    For instance, the data type for title should be **VarChar**.

- **Constraints on entity property values**
    Different data types may have their own constraints. For example, a vector field has a constraint on the number of dimensions, and a VarChar field has a constraint on the maximum number of characters.

Data modeling for a collection is sometimes time-consuming, especially when there are many properties to define. Zilliz Cloud clusters support both dynamic and fixed data modeling to facilitate the process.

### Dynamic data modeling{#dynamic-data-modeling}

A collection can have one primary key field and one vector field. You can create a collection using dynamic modeling without manually defining the properties of the entities in your dataset. Simply give it a name and the number of dimensions for the vector field. Zilliz Cloud will infer the data types and constraints from the data inserted later on.

For example, the following code snippet creates a collection named **medium_articles** without providing it a fixed schema.

```python
from pymilvus import MilvusClient

# Initialize a MilvusClient instance
# Replace uri and API key with your own
client = MilvusClient(
        uri="https://<CLUSTER-ID>.<CLOUD-REGION>.vectordb.zillizcloud.com:<ACCESS-PORT>",
        api_key="<API-KEY>"
)

# Create a collection
client.create_collection(
        collection_name="medium_articles",
        dimension=768
)
```

When you insert an entity into the collection, Zilliz Cloud will parse the data and dynamically infer your collection’s schema accordingly.

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

The inferred schema according to the above piece of data should be similar to the following:

|  **Field name** |  **Inferred data type** |
| --------------- | ----------------------- |
|  id             |  Int64                  |
|  title          |  VarChar(512)           |
|  vector         |  FloatVector(768)       |
|  link           |  VarChar(512)           |
|  reading_time   |  Int64                  |
|  publication    |  VarChar(512)           |
|  claps          |  Int64                  |
|  responses      |  Int64                  |

<Admonition type="info" icon="📘" title="Notes">

Dynamic data modeling may not always be the preferred method, especially when the inserted data is complex and difficult to parse. In such cases, consider using fixed data modeling instead, especially when dynamic data modeling fails to produce the expected results.

</Admonition>

### Fixed data modeling{#fixed-data-modeling}

Representing your data using a fixed data model is a reliable way to keep your data clean and achieve search results that meet your expectations. While the process of fixed data modeling may take time, making changes to it is simple. We highly recommend utilizing fixed data modeling for your dataset.

To create a collection schema using the above data model, you can do as follows:

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

For your reference, Zilliz Cloud supports the following field data types:

- Boolean value (BOOLEAN)

- 8-byte floating-point (DOUBLE)

- 4-byte floating-point (FLOAT)

- Float vector (FLOAT_VECTOR)

- 8-bit integer (INT8)

- 32-bit integer (INT32)

- 64-bit integer (INT64)

- Variable character (VARCHAR)

- [JSON](./javascript-object-notation-json)

## What’s next{#whats-next}

- [Create Collection](./create-collection) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json) 
