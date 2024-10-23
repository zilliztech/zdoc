---
title: "Use Partition Key | BYOC"
slug: /use-partition-key
sidebar_label: "Use Partition Key"
beta: FALSE
notebook: FALSE
description: "This guide walks you through using the partition key to accelerate data retrieval from your collection. | BYOC"
type: origin
token: SbP2wIzHIiRFxwkmojHc02zknsk
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - partition key
  - milvus

---

import Admonition from '@theme/Admonition';


# Use Partition Key

This guide walks you through using the partition key to accelerate data retrieval from your collection.

## Partition Key{#partition-key}

You can set a particular field of a collection as the partition key. By doing so, Zilliz Cloud will distribute incoming entities into different partitions according to the hashes of their respective values in this field. 

You can set the partition key name in the collection schema.

```python
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
    # highlight-start
    partition_key_field="id", # An existing scalar field
    num_partitions=16 # Number of partitions. Defaults to 16.
    # highlight-end
)
```

Alternatively, you can set the partition key when adding fields.

```python
schema.add_field(
    field_name="id",
    datatype=DataType.VARCHAR,
    max_length=512,
    # highlight-next-line
    is_partition_key=True
)
```

After you have created a collection using the above schema, indexed some vector fields, and loaded the collection, you can conduct searches with a search filter involving the partition key. By doing so, Zilliz Cloud narrows the search scope to only the partitions that contain entities matching the partition key values in the search filter, accelerating search performance by avoiding the need to scan irrelevant partitions. 

![WkB0wf0Jshl0hhb2tbzcjNgXnKd](/byoc/WkB0wf0Jshl0hhb2tbzcjNgXnKd.png)

You can include one or multiple partition key values in the search filter as follows:

```python
# Filter based on a single partition key value
filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

## Partition-key Isolation{#partition-key-isolation}

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, the Partition-key Isolation feature is in <strong>Public Preview</strong> and available only to <strong>Performance-optimized</strong> clusters. If you are interested in using this feature, please <a href="https://support.zilliz.com/hc/en-us">submit a ticket</a>.</p>

</Admonition>

If all your search filters involve only a single partition key value as in the multi-tenancy scenario, consider enabling the **Partition-key Isolation** feature. Specifically, you can enable this feature by  using one of the following methods.

```python
# Add properties while creating the collection
client.create_collection(
    collection_name="test_collection",
    schema=schema,
    index_params=index_params,
    # highlight-next-line
    properties={"partitionkey.isolation": "true"}
)

# Or modify the collection with the ORM set_properties API
# highlight-next-line
collection.set_properties({"partitionkey.isolation": "true"})
```

Once you enable this feature in the above created or modified collection and create an index on a vector field, Zilliz Cloud will generate an index file on the vector field for every set of entities with a unique partition key value.

Upon receiving a search request with the search filter involving the partition key, Zilliz Cloud further narrows the search scope to the entities containing the partition key value specified in the search filter.

![UpqgweSighrZWvb3CL7cVm8anec](/byoc/UpqgweSighrZWvb3CL7cVm8anec.png)

After you have enabled Partition-key Isolation in a collection, you can include only one partition key value in the search filter.

```python
# Filter based on the partition key alone
filter='partition_key == "x"'

# Filter based on the partition key and other conditions
filter='partition_key == "x" && <other conditions>'
```

If you want to use the partition key to implement multi-tenancy, you are advised to also enable Partition-key Isolation due to the following reasons:

- **Reduced index and load time**

    With Partition-key Isolation, Zilliz Cloud creates and loads several small index files instead of a large one, spending less time.

- **Reduced search latencies**

    With Partition-key Isolation, Zilliz Cloud further narrows the search scope to certain entities, reducing search latencies.

- **Reduced memory usage** 

    Memory usage is reduced because of smaller index files.

<Admonition type="info" icon="📘" title="Notes">

<p>The above advantages may not be obvious if the number of unique partition key values is less than the number of partitions.</p>

</Admonition>

For all possible multi-tenancy strategies, see [Multi-tenancy](https://milvus.io/docs/multi_tenancy.md).

