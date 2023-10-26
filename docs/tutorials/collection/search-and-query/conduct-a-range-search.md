---
slug: /conduct-a-range-search
beta: TRUE
notebook: 09_search_and_query.ipynb
sidebar_position: 2
---



# Conduct a Range Search

A range search is a way of filtering search results based on the distance between a query vector and a vector field value. The distance can be measured using different metric types, such as Euclidean (L2) and Inner Product (IP).

When performing a range search, Zilliz Cloud first conducts a vector similarity search. It then executes vector filtering based on the specified distance condition, and finally returns the vector results whose distance falls into a specific range.

:::info Notes

The support for range search is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

:::

## Before you start{#before-you-start}

Before conducting a range search, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and inserted data into the collection. For details, see [Use Customized Schema](./undefined).

## Prepare range search parameters{#prepare-range-search-parameters}

Compared to a regular [ANN search](./undefined#search-and-query), a range search in Zilliz Cloud passes in two new parameters `radius` and `range_filter` to control the search range and obtain the desired search results.

- `radius` (FLOAT): the angle where the vector with the least similarity resides.

- `range_filter` (FLOAT): the optional parameter used in combination with `radius` to filter vector field values whose similarity falls within a specific range compared to the query vector.

To measure the distance between vectors, Zilliz Cloud provides two metric types **L2** and **IP**. The metric type used for your collection significantly impacts how you configure `radius` and `range_filter` values.

For the **L2** metric type, smaller distances indicate more similar vectors. To filter out and exclude some of the most similar vectors from search results, you can specify a valid `range_filter` value that is smaller than `radius`. This captures vectors within a range of similarity rather than everything less similar than the `radius` value.

When `metric_type` is set to `L2`, filter vectors whose distance to a query vector is between `0.8` and `1.0`:

```python
# configure search parameters when `metric type` sets to `L2`
param = {
    "metric_type": "L2", # this value must be the same as that specified during collection creation
    "params": {
        "nprobe": 12,
        "radius": 1.0,
        "range_filter": 0.8
    }
}
```

For the **IP** metric type, the situation is somewhat different. In **IP** distance, larger distances represent greater similarity. Therefore, the values of `radius` and `range_filter` in IP distance are reversed compared to **L2** distance. That being said, in **IP** distance, if you use `range_filter` to filter out part of the most similar vectors, a valid `range_filter` value must be greater than `radius`, and the result vectors should be with a distance greater than `radius` but smaller than or equal to `range_filter`.

When `metric_type` is set to `IP`, filter vectors whose distance to a query vector is between `0.8` and `1.0`:

```python
# configure search parameters when `metric type` sets to `IP`
param = {
    "metric_type": "IP", # this value must be the same as that specified during collection creation
    "params": {
        "nprobe": 12,
        "radius": 0.8,
        "range_filter": 1.0
    }
}
```

## Conduct a range search{#conduct-a-range-search}

By configuring `radius` and `range_filter` based on distance metric types, you can define a range scope of result vectors to return.

Once range search parameters are configured, use the following sample code to conduct a range search:

```python
# load the local example dataset
with open('medium_articles_2020_dpr.json') as f:
        data = json.load(f)

# conduct a range search
result = collection.search(
        data = [data['rows'][0]['title_vector']]
        anns_field = 'title_vector'
        param = param
        limit = 5
        output_fields = ['title','link']
)

print(result)

# output:
# ['["id: 1846, distance: 0.800110399723053, entity: {\'title\': \'Simple VSCode Setup To Develop C++\', \'link\': \'https://medium.com/swlh/simple-vscode-setup-to-develop-c-7830182ee4d8\'}", "id: 2906, distance: 0.8001612424850464, entity: {\'title\': \'Binary cross-entropy and logistic regression\', \'link\': \'https://towardsdatascience.com/binary-cross-entropy-and-logistic-regression-bf7098e75559\'}", "id: 4411, distance: 0.8003649115562439, entity: {\'title\': \'Why Passion Is Not Enough in the Working World — Learn Professionalism Instead\', \'link\': \'https://medium.com/swlh/why-passion-is-not-enough-in-the-working-world-learn-professionalism-instead-d1bdb0acd750\'}", "id: 3503, distance: 0.800433337688446, entity: {\'title\': \'Figma to video prototyping — easy way in 3 steps\', \'link\': \'https://uxdesign.cc/figma-to-video-prototyping-easy-way-in-3-steps-d7ac3770d253\'}", "id: 4397, distance: 0.8004650473594666, entity: {\'title\': \'An Introduction to Survey Research\', \'link\': \'https://medium.com/swlh/an-introduction-to-survey-research-ba9e9fb9ca57\'}"]']
```

To get the distances from all returned vectors to the query vector, call the `distances` property:

```python
distances = result[0].distances

print(distances)

# output:
# [0.800110399723053, 0.8001612424850464, 0.8003649115562439, 0.800433337688446, 0.8004650473594666]
```

The preceding command output shows the expected result that the returned vectors fall into a distance between **0.8** and **1.0** to the query vector.

## Takeaways{#takeaways}

A range search in Zilliz Cloud can return similar vector results with a distance falling into a specific range. This functionality is enabled by configuring `radius` and `range_filter` in search parameters. The following table summarizes how a distance metric type can affect the configuration of the two parameters.

|  Metric Type |  Configuration                         |
| ------------ | -------------------------------------- |
|  **L2**      |  `range_filter` <= distance < `radius` |
|  **IP**      |  `radius` < distance <= `range_filter` |

## Related topics{#related-topics}

- [Search, Query, and Get](./search-and-query)

- [[Beta] Search and Query with Iterators](./search-and-query-iterators)

- [[Beta] Search and Query with Advanced Expressions](./search-and-query-advanced-expressions)
