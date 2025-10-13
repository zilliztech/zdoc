---
title: "searchIterator() | Node.js"
slug: /node/node/Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation conducts a scalar filtering with a specified boolean expression. | Node.js"
type: docx
token: KQAidyvxhoVaALxLratcCjMuniU
sidebar_position: 9
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - searchIterator()
  - nodejs25
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# searchIterator()

This operation conducts a scalar filtering with a specified boolean expression.

```javascript
queryIterator(data): Promise<any>
```

## Request Syntax{#request-syntax}

```javascript
 milvusClient.query({
   db_name: string,
   collection_name: string,
   consistency_level?: ConsistencyLevelEnum,
   filter: string,
   ids?: string[] | number[],
   limit?: number,
   offset?: number,
   output_fields?: string[],
   partition_names?: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of the collection to search

- **consistency_level** (*ConsistencyLevelEnum*) -

    The consistency level of the target collection. The value defaults to **Bounded** (**1**) with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

- **data** (*number&#91;&#93;* | *number&#91;&#93;&#91;&#93;*) -

    A list of vector embeddings.

    Zilliz Cloud searches for the most similar vector embeddings to the specified ones.

- **batchSize** (*number*) -

    The number of entities to return per iteration.

- **filter** (*string*) -

    A scalar filtering condition to filter matching entities. 

    The value defaults to an empty string, indicating that no condition applies.

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- **exprValues** (*keyValueObj*) -

    If you choose to use placeholders in `filter` as stated in [Filtering Templating](/docs/filtering-templating), then you can specify the actual values for these placeholders as key-value pairs as the value of this parameter.

- **ignore_growing** (*boolean*) -

    A boolean value indicating whether to skip the search in growing segments.

- **limit** (*number*) - 

    The total number of entities to return.

    You can use this parameter in combination with **offset** in **param** to enable pagination.

    The sum of this value and **offset** in **param** should be less than 16,384. 

    In a grouping search, however, `limit` specifies the maximum number of groups to return, rather than individual entities. Each group is formed based on the specified `group_by_field`.

- **offset** (*number*) - 

    The number of records to skip in the search result. 

    You can use this parameter in combination with `limit` to enable pagination.

    The sum of this value and `limit` should be less than 16,384. 

- **params** (*KeyValueObj*) -

    The additional search parameters in key-value pairs.

    - **radius** (*number*) -

        Determines the threshold of least similarity. When setting `metric_type` to `L2`, ensure that this value is greater than that of **range_filter**. Otherwise, this value should be lower than that of **range_filter**. 

    - **range_filter**  (*number*) -  

        Refines the search to vectors within a specific similarity range. When setting `metric_type` to `IP` or `COSINE`, ensure that this value is greater than that of **radius**. Otherwise, this value should be lower than that of **radius**.

    - **level** (*number*)

        Zilliz Cloud uses a unified parameter to simplify search parameter tuning instead of leaving you to work with a bunch of search parameters specific to various index algorithms.

        The value defaults to **1**, and ranges from **1** to **5**. Increasing the value results in a higher recall rate with degraded search performance.

    - **page_retain_order** (*bool*) -

        Whether to retain the order of the search result when `offset` is provided. 

        This parameter applies only when you also set `radius`.

    - **output_fields** (*string&#91;&#93;*) -

        A list of field names to include in each entity in return.

        The value defaults to **None**. If left unspecified, only the primary field is included.

    - **partition_names** (*string&#91;&#93;*) -

        A list of the names of the partitions to search.

    - **timeout** (*number*) -

        The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **output_fields** (*string&#91;&#93;*) -

    A list of field names to include in each entity in return.

    The value defaults to **None**. If left unspecified, only the primary field is included.

- **partition_names** (*string&#91;&#93;*) -

    A list of the names of the partitions to search.

- **group_by_field** (*string*) -

    Groups search results by a specified field to ensure diversity and avoid returning multiple results from the same group.

- **timeout** (*number*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\&lt;SearchResults&gt;*

This method returns a promise that resolves to a **SearchResults** object.

```javascript
{
    status: object,
    results: list[string],
    recalls: list[number]
}
```

**PARAMETERS:**

- **status** (*object*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

- **results** (*list&#91;object&#93;*) -

    Each result object has the following keys:

    - **id** (*string*) -

        The ID of the search result

    - **score**(*number*) -

        The similarity score of the search result.

    - Plus output fields and their values.

- **recalls** (*list&#91;number&#93;*) -

    Each number indicates the recall rate of a search against a query vector.

## Example{#example}

```plaintext
const queryData = {
  collection_name: 'my_collection',
  expr: 'age > 30',
  limit: 100,
  pageSize: 10
};

const iterator = await queryIterator(queryData);

for await (const batch of iterator) {
  console.log(batch); // Process each batch of query results
}
```

