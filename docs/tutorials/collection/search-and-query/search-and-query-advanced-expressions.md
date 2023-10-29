---
slug: /search-and-query-advanced-expressions
beta: TRUE
notebook: 09_search_and_query.ipynb
sidebar_position: 4
---



# Search and Query with Advanced Expressions

This topic describes how to conduct searches and queries using advanced expressions. In Zilliz Cloud, you can utilize `count(*)` to obtain the count of entities in a collection and `json_contains(field_name,field_value)` to check if a specific element exists in a JSON field.

:::info Notes

The support for advanced expressions `count(*)` and `json_contains()` is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

:::

## Before you start{#before-you-start}

Before using advanced expressions, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- For `json_contains()`, you have defined a JSON field, created a collection with a schema matching the example dataset, and inserted data into the collection. For details, see [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1).

## Count entities{#count-entities}

When conducting a query, you can append `count(*)` to `output_fields`, so Zilliz Cloud can return the count of entities in a collection. If you need to count entities that meet specific conditions, use `expr` to define a Boolean expression to filter data.

### Count all entities{#count-all-entities}

Query the total number of entities in a collection:

```python
num_of_entities = collection.query(expr="",output_fields=["count(*)"])

print(num_of_entities)
print(num_of_entities[0])

# Output:
# [{'count(*)': 5979}]
# {'count(*)': 5979}
```

The code snippet queries a collection and returns the count of entities that meet the conditions specified in the `expr` parameter. In this example, the `expr` parameter is an empty string, indicating that there are no conditions to be satisfied. As a result, the command output provides the total number of entities.

### Count entities that meet specific conditions{#count-entities-that-meet-specific-conditions}

Query the number of entities that meet specific conditions:

```python
entities = collection.query(
    expr='article_meta["claps"] > 30 and article_meta["reading_time"] < 10',
    output_fields=["count(*)"]
)

print(entities)
print(entities[0])

# Output:
# [{'count(*)': 4304}]
# {'count(*)': 4304}
```

The code snippet queries a collection and returns the count of entities that meet the following conditions at the same time:

- The value of the `claps` field in the JSON field `article_meta` is greater than 30.

- The value of the `reading_time` field in the JSON field `article_meta` is less than 10.

## Check if a specific element exists in a JSON field{#check-if-a-specific-element-exists-in-a-json-field}

Search for entities where the `claps` field of the JSON field `article_meta` is greater than 30 and the `reading_time` field is less than 10.

```python
expr='article_meta["claps"] > 30 && article_meta["reading_time"] < 10'

res = collection.search(
    data=[data_rows[0]['title_vector']],
    anns_field='title_vector',
    param={"metric_type":"L2","params":{"nprobe":12}},
    limit=5,
    expr=expr,
    output_fields=['title','article_meta']
)
```

Check if the value **22** is present within the `claps` field of the JSON field `article_meta`:

```python
expr='json_contains(article_meta["claps"], 22)'

res = collection.query(
    expr=expr,
    output_fields=['title','article_meta']
)

print(res)
```

## Related topics{#related-topics}

- [Use Customized Schema](./create-collection-with-schema)

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1)

- [[Beta] Search and Query with Iterators](./search-and-query-iterators)
