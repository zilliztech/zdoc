---
slug: /other-differences
sidebar_position: 3
---



# Other Differences

This article aims to clarify the differences between the two platforms in terms of data types, index types, and some noteworthy behaviors.

If you are planning to migrate from Milvus to Zilliz Cloud, you may need to make some necessary changes to your legacy code.

## Differences in data types{#differences-in-data-types}

Zilliz Cloud supports nearly all data types that Milvus supports, including JSON. However, BinaryVector is currently not available.

For more information on JSON, please refer to [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1).

## Differences in index types{#differences-in-index-types}

Zilliz Cloud offers support for AUTOINDEX as an index type, which means that you don't have to worry about choosing among the various options that Milvus provides. For more information, please refer to [AUTOINDEX Explained](./autoindex-explained).

## Noteworthy behaviors of Zilliz Cloud GUI{#noteworthy-behaviors-of-zilliz-cloud-gui}

When you create a collection on the Graphic User Interface (GUI), Zilliz Cloud not only creates the collection as requested but also automatically indexes the vector field and loads the collection into the Compute Unit (CU) for your convenience.

For more information on CU, please refer to [CU Types Explained](./cu-types-explained-1).

## Related topics{#related-topics}

- [Migrate from Milvus 1.x](./migrate-from-milvus-1x) 

- [Migrate from Milvus 2.x](./migrate-from-milvus-2x) 

- [AUTOINDEX Explained](./autoindex-explained) 

- [CU Types Explained](./cu-types-explained-1) 

- [API Comparison](./api-comparison-between-zilliz-cloud-and-milvus) 
