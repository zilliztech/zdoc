---
title: "Grouping Search | BYOC"
slug: /grouping-search
sidebar_label: "Grouping Search"
beta: FALSE
notebook: FALSE
description: "A grouping search allows Milvus to group the search results by the values in a specified field to aggregate data at a higher level. For example, you can use a basic ANN search to find books similar to the one at hand, but you can use a grouping search to find the book categories that may involve the topics discussed in that book. This topic describes how to use Grouping Search along with key considerations. | BYOC"
type: origin
token: JWZGw89MBiUDBNkhtGfcyyUcnsd
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - grouping search
  - group

---

import Admonition from '@theme/Admonition';


# Grouping Search

A grouping search allows Milvus to group the search results by the values in a specified field to aggregate data at a higher level. For example, you can use a basic ANN search to find books similar to the one at hand, but you can use a grouping search to find the book categories that may involve the topics discussed in that book. This topic describes how to use Grouping Search along with key considerations.

## Overview{#overview}

When entities in the search results share the same value in a scalar field, this indicates that they are similar in a particular attribute, which may negatively impact the search results.

Assume a collection stores multiple documents (denoted by **docId**). To retain as much semantic information as possible when converting documents into vectors, each document is split into smaller, manageable paragraphs (or **chunks**) and stored as separate entities. Even though the document is divided into smaller sections, users are often still interested in identifying which documents are most relevant to their needs.

![LhJEwzWiphLWxobMaiCcbVDPnNb](/byoc/LhJEwzWiphLWxobMaiCcbVDPnNb.png)

When performing an Approximate Nearest Neighbor (ANN) search on such a collection, the search results may include several paragraphs from the same document, potentially causing other documents to be overlooked, which may not align with the intended use case.

![Ktj8wigrHhvz4nbDES5coKZJnZe](/byoc/Ktj8wigrHhvz4nbDES5coKZJnZe.png)

To improve the diversity of search results, you can add the `group_by_field` parameter in the search request to enable Grouping Search. As shown in the diagram, you can set `group_by_field` to `docId`. Upon receiving this request, Milvus will:

- Perform an ANN search based on the provided query vector to find all entities most similar to the query.

- Group the search results by the specified `group_by_field`, such as `docId`.

- Return the top results for each group, as defined by the `limit` parameter, with the most similar entity from each group.

<Admonition type="info" icon="📘" title="Notes">

<p>By default, Grouping Search returns only one entity per group. If you want to increase the number of results to return per group, you can control this with the <code>group_size</code> and <code>strict_group_size</code> parameters.</p>

</Admonition>

## Perform Grouping Search{#perform-grouping-search}

This section provides example code to demonstrate the use of Grouping Search. The following example assumes the collection includes fields for `id`, `vector`, `chunk`, and `docId`.

[Unsupported block type]

In the search request, set both `group_by_field` and `output_fields` to `docId`. Milvus will group the results by the specified field and return the most similar entity from each group, including the value of `docId` for each returned entity.

[Unsupported block type]

In the request above, `limit=3` indicates that the system will return search results from three groups, with each group containing the single most similar entity to the query vector.

## Configure group size{#configure-group-size}

By default, Grouping Search returns only one entity per group. If you want multiple results per group, adjust the `group_size` and `strict_group_size` parameters.

[Unsupported block type]

In the example above:

- `group_size`: Specifies the desired number of entities to return per group. For instance, setting `group_size=2` means each group (or each `docId`) should ideally return two of the most similar paragraphs (or **chunks**). If `group_size` is not set, the system defaults to returning one result per group.

- `strict_group_size`: This boolean parameter controls whether the system should strictly enforce the count set by `group_size`. When `strict_group_size=True`, the system will attempt to include the exact number of entities specified by `group_size` in each group (e.g., two paragraphs), unless there isn’t enough data in that group. By default (`strict_group_size=False`), the system prioritizes meeting the number of groups specified by the `limit` parameter, rather than ensuring each group contains `group_size` entities. This approach is generally more efficient in cases where data distribution is uneven.

For additional parameter details, refer to [search](/reference/python/python/Vector-search).

## Considerations{#considerations}

- **Number of groups**: The `limit` parameter controls the number of groups from which search results are returned, rather than the specific number of entities within each group. Setting an appropriate `limit` helps control search diversity and query performance. Reducing `limit` can reduce computation costs if data is densely distributed or performance is a concern.

- **Entities per group**: The `group_size` parameter controls the number of entities returned per group. Adjusting `group_size` based on your use case can increase the richness of search results. However, if data is unevenly distributed, some groups may return fewer entities than specified by `group_size`, particularly in limited data scenarios.

- **Strict group size**: When `strict_group_size=True`, the system will attempt to return the specified number of entities (`group_size`) for each group, unless there isn’t enough data in that group. This setting ensures consistent entity counts per group but may lead to performance degradation with uneven data distribution or limited resources. If strict entity counts aren’t required, setting `strict_group_size=False` can improve query speed.

