---
title: "DataType | Python | MilvusClient"
slug: /python/python/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Python | MilvusClient"
type: docx
token: MKrAdumLvohQfDxgpMwcEB8dnqb
sidebar_position: 7
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - DataType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# DataType

This is an enumeration that provides the following constants.

## Constants\{#constants}

- BOOL

    Sets the data type to **Boolean**.

- INT8

    Sets the data type to **Int8**.

- INT16

    Sets the data type to **Int16**.

- INT32

    Sets the data type to **Int32**.

- INT64

    Sets the data type to **Int64**.

- FLOAT

    Sets the data type to **Float**.

- DOUBLE

    Sets the data type to **Double**.

- VARCHAR

    Sets the data type to **Varchar**.

- TEXT

    Sets the data type to **TEXT**. Use this scalar type to store long text content such as documents, passages, tickets, or logs. Unlike **VARCHAR**, TEXT does not require `max_length`.

- ARRAY

    Sets the data type to **Array**.

- JSON

    Sets the data type to **JSON**.

- GEOMETRY

    Sets the datatype to **Geometry**.

- TIMESTAMPTZ

    Sets the datatype to **TIMESTAMPTZ**.

- STRUCT

    Sets the data type of the elements in an Array field to **Struct**.

- FLOAT_VECTOR

    Sets the data type to **Float Vector**.

- BINARY_VECTOR

    Sets the data type to **Binary Vector**.

- FLOAT16_VECTOR

    Sets the data type to **Float16 Vector**.

- BFLOAT16_VECTOR

    Sets the data type to **BFloat16 Vector**.

- INT8_VECTOR

    Sets the data type to **Int8 Vector**. This data type is designed for quantized deep learning models (e.g., ResNet, EfficientNet), which reduces model size and speeds up inference with minimal precision loss.

- SPARSE_FLOAT_VECTOR

    Sets the data type to **Sparse Vector**.