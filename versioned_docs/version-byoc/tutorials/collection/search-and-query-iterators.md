---
slug: /search-and-query-iterators
beta: TRUE
notebook: 09_search_query_iterators.ipynb
token: SSKfwgLfKiX6XpkYYDycL0rln92
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# Search and Query with Iterators

This guide is designed to help you search and query large datasets using the power of iterators. Below, you'll find step-by-step instructions on how to effectively use iterators for better performance and simplicity in your data operations.

## Overview{#overview}

Iterators are advanced tools that enable you to navigate through large datasets by working with primary key values and Boolean expressions, which can greatly optimize the way you retrieve data from Zilliz Cloud. Unlike the traditional use of `offset` and `limit` parameters, which may become less efficient over time, iterators provide a more scalable solution.

### Benefits of using iterators{#benefits-of-using-iterators}

- **Simplicity**: Eliminate the complex `offset` and `limit` configurations.

- **Efficiency**: Enjoy faster data retrieval by fetching data as needed.

- **Consistency**: Ensure a consistent dataset size during each iteration with Boolean filters.

<Admonition type="info" icon="📘" title="Notes">

The support for iterators is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

</Admonition>

## Before you start{#before-you-start}

Before searching or querying with an iterator, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

## Prepare your dataset{#prepare-your-dataset}

To set up your environment:

1. Create a collection with a schema corresponding to your dataset:

```python
# 0. Connect to cluster
connections.connect(
    uri=CLUSTER_ENDPOINT, # Public endpoint obtained from Zilliz Cloud
    token=TOKEN, # API key or a colon-separated cluster username and password
)

# 1. Define fields
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

# 2. Build the schema
schema = CollectionSchema(
    fields,
    description="Schema of Medium articles",
    enable_dynamic_field=False
)

# 3. Create collection
collection = Collection(
    name='medium_articles', 
    description="Medium articles published between Jan and August in 2020 in prominent publications",
    schema=schema
)

# 4. Index collection
# 'index_type' defines the index algorithm to be used.
#    AUTOINDEX is the only option.
#
# 'metric_type' defines the way to measure the distance 
#    between vectors. Possible values are L2, IP, and Cosine,
#    and defaults to Cosine.
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
    "params": {}
}

# To name the index, do as follows:
collection.create_index(
    field_name="title_vector", 
    index_params=index_params,
)

# 5. Load collection
collection.load()

# Get loading progress
progress = utility.loading_progress(COLLECTION_NAME)

print(progress)

# Output
#
# {
#     "loading_progress": "100%"
# }

```

1. Prepare the dataset for insertion:

```python
# Prepare a list of rows
with open('medium_articles_2020_dpr.json') as f:
    data = json.load(f)
    rows = data['rows']

print(rows[:3])

# Output
#
# [
#     {
#         "id": 0,
#         "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#         "title_vector": [
#             0.041732933,
#             0.013779674,
#             -0.027564144,
#             -0.013061441,
#             0.009748648,
#             0.00082446384,
#             -0.00071647146,
#             0.048612226,
#             -0.04836573,
#             -0.04567751,
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
#         "reading_time": 13,
#         "publication": "The Startup",
#         "claps": 1100,
#         "responses": 18
#     },
#     {
#         "id": 1,
#         "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else",
#         "title_vector": [
#             0.0039737443,
#             0.003020432,
#             -0.0006188639,
#             0.03913546,
#             -0.00089768134,
#             0.021238148,
#             0.014454661,
#             0.025742851,
#             0.0022063442,
#             -0.051130578,
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a",
#         "reading_time": 14,
#         "publication": "The Startup",
#         "claps": 726,
#         "responses": 3
#     },
#     {
#         "id": 2,
#         "title": "How Can We Best Switch in Python?",
#         "title_vector": [
#             0.031961977,
#             0.00047043373,
#             -0.018263113,
#             0.027324716,
#             -0.0054595284,
#             -0.014779159,
#             0.017511465,
#             0.030381083,
#             -0.018930407,
#             -0.03372473,
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/how-can-we-best-switch-in-python-458fb33f7835",
#         "reading_time": 6,
#         "publication": "The Startup",
#         "claps": 500,
#         "responses": 7
#     }
# ]

# Insert data
results = collection.insert(rows)

print(f"Data inserted successfully! inserted rows: {results.insert_count}")

# Output
#
# Data inserted successfully! inserted rows: 5979

time.sleep(10)
```

## Search with an iterator{#search-with-an-iterator}

Iterators streamline the process of searching for entities similar to a query vector. The following steps guide you through the search operation:

1. Initialize the search iterator to define the search parameters and output fields.

1. Use the `next()` method within a loop to paginate through the search results:

    - If `next()` returns an empty array, end the loop; no more pages are available.

    - If results are found, they will display the specified output fields.

1. Close the iterator using `close()` once all the data has been retrieved.

```python
# 8. Search vectors

query_vector = rows[0]['title_vector']

# Define search parameters
search_params = {
    "metric_type": "L2",
    "params": {"nprobe": 10}
}

# Execute search
iterator = collection.search_iterator(
    data=[query_vector], 
    anns_field="title_vector",
    batch_size=10,
    limit=100, 
    param=search_params,
    output_fields=["title", "link", "publication"]
)

results = []

while True:
    result = iterator.next()
    if len(result) == 0:
        iterator.close()
        break;

    for x in range(len(result)):
        results.append(result[x])

results = [ { 
    "id": x.id,
    "distance": x.distance,
    "entity": {
        "title": x.entity.get("title"),
        "link": x.entity.get("link"),
        "publication": x.entity.get("publication")
        },
    } for x in results]

print(results[:3])

# Output
#
# [
#     {
#         "id": 0,
#         "distance": 0.0,
#         "entity": {
#             "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#             "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
#             "publication": "The Startup"
#         }
#     },
#     {
#         "id": 3177,
#         "distance": 0.29999834299087524,
#         "entity": {
#             "title": "Following the Spread of Coronavirus",
#             "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125",
#             "publication": "Towards Data Science"
#         }
#     },
#     {
#         "id": 5607,
#         "distance": 0.36103832721710205,
#         "entity": {
#             "title": "The Hidden Side Effect of the Coronavirus",
#             "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586",
#             "publication": "The Startup"
#         }
#     }
# ]
```

## Query with an iterator{#query-with-an-iterator}

Query iterators provide a reliable and accurate pagination method by iterating over primary key expressions (`expr`), ensuring accuracy in pagination due to the query's `selectLowestPK` reduction principle. Follow these steps to perform a query with an iterator:

1. Initiate the query iterator.

1. Use `expr` to consistently filter and paginate results.

```python
# 9. Query with iterators

iterator = collection.query_iterator(
    batch_size=10,
    limit=100,
    expr="claps > 1000",
    output_fields=["title", "link", "claps"]
)

results = []

while True:
    result = iterator.next()
    if len(result) == 0:
        iterator.close()
        break;

    for x in range(len(result)):
        results.append(result[x])

print(results[:3])

# Output
#
# [
#     {
#         "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
#         "claps": 1100,
#         "id": 0
#     },
#     {
#         "title": "What I Learned From Walking 3000 Miles to Work",
#         "link": "https://medium.com/swlh/what-i-learned-from-walking-3000-miles-to-work-5bf210ab18b3",
#         "claps": 1600,
#         "id": 34
#     },
#     {
#         "title": "How to Be Memorable in Social Settings",
#         "link": "https://medium.com/personal-growth/how-to-be-memorable-in-social-settings-9fabcf80d20d",
#         "claps": 8600,
#         "id": 66
#     }
# ]
```

## Related topics{#related-topics}

- [Create Collection](./create-collection)

- [Use Partition Key](./use-partition-key)

- [[Beta] Upsert Data](./upsert-entities)

- [Search and Query with Advanced Expressions](./search-and-query-advanced-expressions)

