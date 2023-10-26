---
slug: /search-and-query-iterators
beta: TRUE
notebook: 09_search_and_query.ipynb
sidebar_position: 3
---



# Search and Query with Iterators

Before an iterator is introduced, one common way of querying or searching a large dataset in Zilliz Cloud is to use `offset` and `limit` parameters in combination, which specify the starting position and the maximum number of items to return, respectively. However, this approach may result in performance issues when your database accumulates more data than your server can store in memory, and you still need to paginate through all the data.

To address performance issues, an alternative is to use an iterator, which is an object that allows you to use `expr` to filter scalar fields by primary key values and then iterate over a sequence of search or query results. Using an iterator features evident benefits:

- It simplifies the code and eliminates the need for manual configuration of `offset` and `limit`.

- It is more efficient and consistent, as it filters fields by Boolean expressions initially and fetches data on demand.

This topic describes how to search and query data with iterators.

:::info Notes

The support for iterators is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

:::

## Before you start{#before-you-start}

Before searching or querying with an iterator, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and inserted data into the collection. For details, see [Use Customized Schema](./undefined).

## Search with an iterator{#search-with-an-iterator}

The following example code initiates a search iterator and searches for the most similar results to the given query vector, with `reading_time` between **5** and **10** (exclusive).

```python
# load the local example dataset
with open('medium_articles_2020_dpr.json') as f:
        data = json.load(f)

# initiate a search iterator
search_iterator = collection.search_iterator(
    data=[data['rows'][0]['title_vector']],
    anns_field='title_vector',
    param={'metric_type':'L2','nprobe':12},
    limit=5,
    expr='5 < reading_time < 10',
    output_fields=['title','reading_time']
)

while True:
    result = search_iterator.next()
    if len(result) == 0:
        print('Search iteration finished, close')
        search_iterator.close()
        break
    for x in range(len(result)):
        print(result[x])

# Output:
# id: 5607, distance: 0.36103832721710205, entity: {'title': 'The Hidden Side Effect of the Coronavirus', 'reading_time': 8}
# id: 5641, distance: 0.3767401874065399, entity: {'title': 'Why The Coronavirus Mortality Rate is Misleading', 'reading_time': 9}
# id: 938, distance: 0.43609383702278137, entity: {'title': 'Mortality Rate As an Indicator of an Epidemic Outbreak', 'reading_time': 6}
# id: 4275, distance: 0.4888632297515869, entity: {'title': 'How Can AI Help Fight Coronavirus?', 'reading_time': 9}
# id: 842, distance: 0.49443867802619934, entity: {'title': 'Choosing the right performance metrics can save lives against Coronavirus', 'reading_time': 9}
# Search iteration finished, close
```

In the preceding code, the iterator's `next()` method is called repeatedly to retrieve each page of results. If the length of the returned results is zero, it means that there are no more pages to retrieve, so the loop is exited and the iterator is closed by using `close()`. Otherwise, the results are printed to the console, with each result showing `title` and `reading_time`.

## Query with an iterator{#query-with-an-iterator}

The following example code initiates a query iterator and filters results whose `reading_time` is between **5** and **10** (exclusive).

```python
# initiate a query iterator
query_iterator = collection.query_iterator(
    limit=5,
    expr='5 < reading_time < 10',
    output_fields=['title','reading_time']
)

while True:
    result = query_iterator.next()
    if len(result) == 0:
        print('Query iteration finished, close')
        query_iterator.close()
        break
    for x in range(len(result)):
        print(result[x])

# Output:
# {'title': 'How Can We Best Switch in Python?', 'reading_time': 6, 'id': 2}
# {'title': 'Maternity leave shouldn’t set women back', 'reading_time': 9, 'id': 3}
# {'title': 'Python NLP Tutorial: Information Extraction and Knowledge Graphs', 'reading_time': 7, 'id': 4}
# {'title': 'Guide to Nest JS-RabbitMQ Microservices', 'reading_time': 7, 'id': 5}
# {'title': 'Science Monday: Can You Drink As Much Water As Tom Brady?', 'reading_time': 6, 'id': 6}
# Query iteration finished, close
```

## Related topics{#related-topics}

- [Use Customized Schema](./undefined)

- [Use Partition Key](./use-partition-key)

- [[Beta] Upsert Data](./upsert-entities)
