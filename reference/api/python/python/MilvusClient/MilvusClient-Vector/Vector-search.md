---
displayed_sidbar: pythonSidebar
slug: /python/Vector-search
beta: false
notebook: false
token: D74JdcitKobd7cxNdDdcGAz6nuf
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# search()

This operation conducts a vector similarity search with an optional scalar filtering expression.

## Request syntax{#request-syntax}

```python
search(
    collection_name: str,
    data: Union[List[list], list],
    filter: str = "",
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    search_params: Optional[dict] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __data__ (_List[list], list]_) -

    __[REQUIRED]__

    A list of vector embeddings.

    Zilliz Cloud searches for the most similar vector embeddings to the specified ones.

- __filter__ (_str_) -

    A scalar filtering condition to filter matching entities. 

    The value defaults to an empty string, indicating that no condition applies.

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- __limit__ (_int_) -

    The total number of entities to return.

    You can use this parameter in combination with __offset__ in __param__ to enable pagination.

    The sum of this value and __offset__ in __param__ should be less than 16,384. 

- __output_fields__ (l_ist[str]_) -

    A list of field names to include in each entity in return.

    The value defaults to __None__. If left unspecified, only the primary field is included.

- __search_params__ (_dict_) -

    The parameter settings specific to this operation.

    - __metric_type__ (_str_) -

        The metric type applied to this operation. This should be the same as the one used when you index the vector field specified above. 

        Possible values are __L2__, __IP__, and __COSINE__.

    - __params__ (dict) -

        Additional parameters

        - __radius__ (float) -

            Determines the threshold of least similarity. When setting `metric_type` to `L2`, ensure that this value is greater than that of __range_filter__. Otherwise, this value should be lower than that of __range_filter__. 

        - __range_filter__  (float) -  

            Refines the search to vectors within a specific similarity range. When setting `metric_type` to `IP` or `COSINE`, ensure that this value is greater than that of __radius__. Otherwise, this value should be lower than that of __radius__.

    For details on other applicable search parameters, read [AUTOINDEX Explained](./autoindex-explained) to get more.

- __timeout__ (_float_ | _None_) -

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

- __partition_names__ (_list_) -

    A list of partition names.

    The value defaults to __None__. If specified, only the specified partitions are involved in queries.

- __kwargs__ -

    - __offset__ (int) -

        The number of records to skip in the search result. 

        You can use this parameter in combination with `limit` to enable pagination.

        The sum of this value and `limit` should be less than 16,384. 

    - __round_decimal__ (int) -

        The number of decimal places that Zilliz Cloud rounds the calculated distances to.

        The value defaults to __-1__, indicating that Zilliz Cloud skips rounding the calculated distances and returns the raw value.

__RETURN TYPE:__

_list[dict]_

__RETURNS:__
A list of dictionaries that contains the searched entities with specified output fields.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

## Related methods{#related-methods}

- [delete()](./Vector-delete)

- [get()](./Vector-get)

- [insert()](./Vector-insert)

- [query()](./Vector-query)

- [upsert()](./Vector-upsert)

