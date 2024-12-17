---
title: "Search Iterator | Cloud"
slug: /with-iterators
sidebar_label: "Search Iterator"
beta: FALSE
notebook: FALSE
description: "The ANN Search has a maximum limit on the number of entities that can be recalled in a single query, and simply using basic ANN Search may not meet the demands of large-scale retrieval. For ANN Search requests where topK exceeds 16,384, it is advisable to consider using the SearchIterator. This section will introduce how to use the SearchIterator and related considerations. | Cloud"
type: origin
token: QVTnwVz2aifvSAkgomAc9KWRnHb
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search iterators

---

import Admonition from '@theme/Admonition';


# Search Iterator

The ANN Search has a maximum limit on the number of entities that can be recalled in a single query, and simply using basic ANN Search may not meet the demands of large-scale retrieval. For ANN Search requests where topK exceeds 16,384, it is advisable to consider using the SearchIterator. This section will introduce how to use the SearchIterator and related considerations.

## Overview{#overview}

A Search request returns search results, while a SearchIterator returns an iterator. You can call the **next()** method of this iterator to get the search results.

Specifically, you can use the SearchIterators as follows:

1. Create a SearchIterator and set **the number of entities to return per search request** and **the total number of entities to return**.

1. Call the **next()** method of the SearchIterator in a loop to get the search result in a paginated manner.

1. Call the **close()** method of the iterator to end the loop if the **next()** method returns an empty result.

## Create SearchIterator{#create-searchiterator}

The following code snippet demonstrates how to create a SearchIterator.

[Unsupported block type]

In the above examples, you have set the number of entities to return per search (**batch_size**/**batchSize**) to 50, and the total number of entities to return (**topK**) to 20,000.

## Use SearchIterator{#use-searchiterator}

Once the SearchIterator is ready, you can call its next() method to get the search results in a paginated manner.

[Unsupported block type]

In the above code examples, you have created an infinite loop and called the **next()** method in the loop to store the search results in a variable and closed the iterator when the **next()** returns nothing.