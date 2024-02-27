---
slug: /index-scalar-fields
beta: FALSE
notebook: FALSE
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Index Scalar Fields

On Zilliz Cloud, scalar fields, which refer to single numbers or strings, can be efficiently indexed for improved query performance.

This guide provides an overview of how to index scalar fields in a collection.

## Overview{#overview}

Milvus allows indexing both vector and scalar fields. Here, we focus on scalar fields, which are single-value fields. Various data types are supported for scalar fields. Refer to [Supported data types](https://milvus.io/docs/schema.md#Supported-data-type) for more information.

### Types of scalar indexing{#types-of-scalar-indexing}

There are two main approaches to indexing scalar fields:

- __Default Index__: Automatically created based on the scalar field's data type, without the need to specify any index parameters.

- __Inverted Index__: Created with specific index parameters for enhanced query efficiency.

## Create a default index{#create-a-default-index}

To create a default index on scalar fields, simply omit setting any index parameters. The system automatically assigns a default index name `_default_idx_<fieldId>`, followed by the name of the indexed field. If necessary, you can also customize it.

Here is an example of creating a default index:

```python
# Create default index

# Get existing collection
collection = Collection(name='{your_collection_name}') # Replace with the actual name of your collection

collection.create_index(
  field_name="scalar_int", # Specify the field name to index
  index_name="default_index", # Specify the index name
)

# Output:
# Status(code=0, message=)
```

Refer to [Scalar Index](https://milvus.io/docs/scalar_index.md#Scalar-field-indexing-algorithms) for detailed information on default indexing algorithms.

