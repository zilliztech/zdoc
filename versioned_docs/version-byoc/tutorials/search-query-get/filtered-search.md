---
title: "Filtered Search | BYOC"
slug: /filtered-search
sidebar_label: "Filtered Search"
beta: FALSE
notebook: FALSE
description: "An ANN search finds vector embeddings most similar to specified vector embeddings. However, the search results may not always be correct. You can include filtering conditions in a search request so that Zilliz Cloud conducts metadata filtering before conducting ANN searches, reducing the search scope from the whole collection to only the entities matching the specified filtering conditions. | BYOC"
type: origin
token: CpBbwcJ87irHp0k9oCSc2RNIn3d
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filtered search
  - filtering

---

import Admonition from '@theme/Admonition';


# Filtered Search

An ANN search finds vector embeddings most similar to specified vector embeddings. However, the search results may not always be correct. You can include filtering conditions in a search request so that Zilliz Cloud conducts metadata filtering before conducting ANN searches, reducing the search scope from the whole collection to only the entities matching the specified filtering conditions.

## Overview{#overview}

If a collection contains both vector embeddings and their metadata, you can filter metadata before ANN search to improve the relevancy of the search result. Once Zilliz Cloud receives a search request carrying a filtering condition, it restricts the search scope within the entities matching the specified filtering condition.

![QIeKwvDN1h7lTnb9iJ7cPubknrb](/byoc/QIeKwvDN1h7lTnb9iJ7cPubknrb.png)

As shown in the above diagram, the search request carries `chunk like % red %` as the filtering condition, indicating that Zilliz Cloud should conduct the ANN search within all the entities that have the word `red` in the `chunk` field. Specifically, Zilliz Cloud does the following:

- Filter entities that match the filtering conditions carried in the search request.

- Conduct the ANN search within the filtered entities.

- Returns top-K entities.

## Examples{#examples}

This section demonstrates how to conduct a filtered search. Code snippets in this section assume  you already have the following entities in your collection. Each entity has four fields, namely **id**, **vector**, **color**, and **likes**.

[Unsupported block type]

The search request in the following code snippet carries a filtering condition and several output fields.

[Unsupported block type]

The filtering condition carried in the search request reads `color like "red%" and likes > 50`. It uses the and operator to include two conditions: the first one asks for entities that have a value starting with `red` in the `color` field, and the other asks for entities with a value greater than `50` in the `likes` field. There are only two entities meeting these requirements. With the top-K set to `3`, Zilliz Cloud will calculate the distance between these two entities to the query vector and return them as the search results.

[Unsupported block type]

For more information on the operators that you can use in metadata filtering, refer to [Filtering](./filtering).