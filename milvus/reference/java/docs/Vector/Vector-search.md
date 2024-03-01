---
displayed_sidbar: javaSidebar
slug: /java/Vector-search
beta: false
notebook: false
type: docx
token: U2HYdGZBjoOlCJxt9D4csF1untT
sidebar_position: 5
---

# search()

This operation conducts a vector similarity search with an optional scalar filtering expression.

```java
public SearchResp search(SearchReq request)
```

## Request Syntax{#request-syntax}

```java
search(SearchReq.builder()
    .collectionName(String collectionName)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .data(List<Object> data)
    .filter(String filter)
    .limit(long limit)
    .offset(long offset)
    .outputFields(List<String> outputFields)
    .partitionNames(List<String> partitionNames)
    .searchParams(String searchParams)
    .topK(int topK)
    .vectorFieldName(String vectorFieldName)
    .gracefulTime(long gracefulTime)
    .guaranteeTimestamp(long guaranteeTimestamp)
    .ignoreGrowing(boolean ignoreGrowing)
    .roundDecimal(int roundDecimal)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level of the target collection.

    The value defaults to the one specified when you create the current collection, with options of __Strong __(__0__), __Bounded __(__1__), __Session __(__2__), and __Eventually __(__3__).

    <div class="admonition note">

    <p><b>what is the consistency level?</b></p>

    <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
    <p>Milvus supports four consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, <strong>Session</strong>, and <strong>Eventually</strong>. The default consistency level in Milvus is <strong>Bounded Staleness</strong>.</p>
    <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

    </div>

- `data(List<Object> data)`

    A list of vector embeddings.

    Milvus searches for the most similar vector embeddings to the specified ones.

- `filter(String filter)`

    A scalar filtering condition to filter matching entities. 

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- `limit(long limit)`

    The number of records to return in the search result. This parameter uses the same syntax as the `topK` parameter, so you should only set one of them.

    You can use this parameter in combination with `offset` to enable pagination.

    The sum of this value and `offset` should be less than 16,384. 

- `offset(long offset)`

    The number of records to skip in the query result. 

    You can use this parameter in combination with `limit` to enable pagination.

    The sum of this value and `limit` should be less than 16,384. 

- `outputFields(List<String> outputFields)`

    A list of field names to include in each entity in return.

    The value defaults to __None__. If left unspecified, all fields are selected as the output fields.

- `partitionNames(List<String> partitionNames)`

    A list of partition names.

- `searchParams(Map<String,Object> searchParams)`

    The parameter settings specific to this operation.

    - __metric_type__ (String)

        The metric type applied to this operation. This should be the same as the one used when you index the vector field specified above. 

        Possible values are __L2__, __IP__, and __COSINE__.

    - __params__ (`Map<String,Object>`)

        Additional parameters.

        - radius (float)

            Determines the threshold of least similarity. When setting `metric_type` to `L2`, ensure that this value is greater than that of __range_filter__. Otherwise, this value should be lower than that of __range_filter__. 

        - range_filter (float)

            Refines the search to vectors within a specific similarity range. When setting `metric_type` to `IP` or `COSINE`, ensure that this value is greater than that of __radius__. Otherwise, this value should be lower than that of __radius__.

    For details on other applicable search parameters, refer to [In-memory Index](https://milvus.io/docs/index.md) and [On-disk Index](https://milvus.io/docs/disk_index.md).

- `topK(int topK)`

    The number of records to return in the search result. This parameter uses the same syntax as the `limit` parameter, so you should only set one of them.

    You can use this parameter in combination with `offset` to enable pagination.

    The sum of this value and `offset` should be less than 16,384. 

- `vectorFieldName(String vectorFieldName)`

    The name of the vector field. The value defaults to __vector__.

- `gracefulTime(long gracefulTime)`

    A period of time in ms.

    The value defaults to __5000L__. If this parameter is set, MilvusZilliz Cloud calculates the guarantee timestamp by subtracting this from the current timestamp.

    <div class="admonition note">

    <p><b>notes</b></p>

    <p>This parameter is valid when a consistency level other than the default one applies.</p>

    </div>

- `guaranteeTimestamp(long guaranteeTimestamp)`

    A valid timestamp. 

    If this parameter is set, MilvusZilliz Cloud executes the query only if all entities inserted before this timestamp are visible to query nodes. 

    <div class="admonition note">

    <p><b>notes</b></p>

    <p>This parameter is valid when the default consistency level applies.</p>

    </div>

- `ignoreGrowing(boolean ignoreGrowing)`

    Whether to ignore growing segments during similarity searches.

- `roundDecimal(int roundDecimal)`

    The number of decimal places that Milvus rounds the calculated distances to.

    The value defaults to __-1__, indicating that Milvus skips rounding the calculated distances and returns the raw value.

__RETURN TYPE:__

_List\<SearchResult\>_

__RETURNS:__

A list of __SearchResult objects representing specific search results with the specified output fields and relevance score.

__PARAMETERS:__

- __fields__ (_Map\<String, Object\>_)

    A map that stores the specific fields associated with the search result.

- __score__ (_Float_)

    The relevance score of the search result. The score indicates how closely the vector associated with the search result matches the query vector.

<div class="admonition note">

<p><b>notes</b></p>

<p>If the number of returned entities is less than expected, duplicate entities may exist in your collection.</p>

</div>

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<Float> vectorList = new ArrayList<>();
vectorList.add(1.0f);
vectorList.add(2.0f);

SearchReq searchReq = SearchReq._builder_()
        .collectionName("test")
        .data(Collections._singletonList_(vectorList))
        .topK(10)
        .build();
SearchResp searchResp = client_v2.search(searchReq);
```

