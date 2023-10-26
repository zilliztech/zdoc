---
slug: /upsert-entities
beta: TRUE
notebook: 08_insert_and_upsert.ipynb
sidebar_position: 2
---



# Upsert Entities

This topic describes how to upsert data into a collection in Zilliz Cloud.

Upserting data is a combination of update and insert operations. In Zilliz Cloud, an upsert operation performs a data-level action to either insert or update an entity based on whether its primary key already exists in a collection. Specifically:

- If the primary key of the entity already exists in the collection, the existing entity will be overwritten.

- If the primary key does not exist in the collection, a new entity will be inserted.

:::info Notes

The support for data upsert is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

:::

## Before you start{#before-you-start}

Before upserting data, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Use Customized Schema](./undefined).

## Prepare data{#prepare-data}

In this example, we upsert the first 100 entities in the example dataset. You can use the following code to process data:

```python
# retrieve the first 100 entities in the example dataset
import json

with open('medium_articles_2020_dpr.json') as f:
    data = json.load(f)
    data_to_upsert = data["rows"][:100]

display(data_to_upsert[:1])

# Output:
# [{'id': 0,
#   'title': 'The Reported Mortality Rate of Coronavirus Is Not Important',
#   'title_vector': [0.041732933,
#    0.013779674,
#    -0.027564144,
#    -0.013061441,
#    0.009748648,
#    0.00082446384,
#    -0.00071647146,
#    0.048612226,
#    -0.04836573,
#    -0.04567751,
#    0.018008126,
#    0.0063936645,
#    -0.011913628,
#    0.030776596,
#    -0.018274948,
#    0.019929802,
#    0.020547243,
#    0.032735646,
#    -0.031652678,
#    -0.033816382,
#    -0.051087562,
#    -0.033748355,
#    0.0039493158,
# ...
#   'link': 'https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912',
#   'reading_time': 13,
#   'publication': 'The Startup',
#   'claps': 1100,
#   'responses': 18}]
```

## Upsert data{#upsert-data}

Once the data is ready, use the following code to upsert it to the collection:

```python
# upsert entities
from pymilvus import Collection

# get existing collection
collection = Collection("medium_articles")

# upsert data
result = collection.upsert(data_to_upsert)

# flush data into memory
collection.flush()

print(f"Data upserted successfully! Upserted rows: {result.upsert_count}")

# Output:
# Data upserted successfully! Upserted rows: 100
```

## On flushing data{#on-flushing-data}

In Zilliz Cloud, data from upsert operations will be flushed (written to storage) eventually without needing to call the `flush()` API after each upsert. However, if you need to immediately search the data after an upsert, it is recommended to call `flush()` first.

The `flush()` API seals data segments, making the upserted records ready to be retrieved in searches. Without flushing, a search directly after an upsert may not return the new or updated records right away, as the data has not been sealed and indexed yet.

## Limits{#limits}

- Upsert operations do not allow updating the primary key field.

- Upsert operations cannot be used on collections where `autoID` is set to `True` for the primary key field.

## Related topics{#related-topics}

- [Use Customized Schema](./undefined)

- [Enable Dynamic Schema](./enable-dynamic-schema)

- [Use Partition Key](./use-partition-key)
