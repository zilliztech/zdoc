---
displayed_sidbar: pythonSidebar
slug: /python/Vector-search
beta: false
notebook: false
type: docx
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

    Milvus searches for the most similar vector embeddings to the specified ones.

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

    For details on other applicable search parameters, refer to [In-memory Index](https://milvus.io/docs/index.md) and [On-disk Index](https://milvus.io/docs/disk_index.md).

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

        The number of decimal places that Milvus rounds the calculated distances to.

        The value defaults to __-1__, indicating that Milvus skips rounding the calculated distances and returns the raw value.

__RETURN TYPE:__

_list[dict]_

__RETURNS:__
A list of dictionaries that contains the searched entities with specified output fields.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Insert data
client.insert(
    collection_name="test_collection",
    data=[
         {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
         {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
         {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
         {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
         {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
         {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
         {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
         {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
         {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
         {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
     ],
)

# 4. Conduct a search
search_params = {
    "metric_type": "IP",
    "params": {}
}

# Search with limit
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    search_params=search_params
)

# Search with filter
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    filter='color like "red%"',
    search_params=search_params
)

# Search with an offset
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    offset=3,
    search_params=search_params
)

# Search with output fields
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    output_fields=["vector", "color"],
    search_params=search_params
)

# Conduct a range search
search_params = {
    "metric_type": "IP",
    "params": {
        "radius": 0.8,
        "range_filter": 1.0
    }
}

res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    search_params=search_params
)
```

## Related methods{#related-methods}

- [delete()](./Vector-delete)

- [get()](./Vector-get)

- [insert()](./Vector-insert)

- [query()](./Vector-query)

- [upsert()](./Vector-upsert)

