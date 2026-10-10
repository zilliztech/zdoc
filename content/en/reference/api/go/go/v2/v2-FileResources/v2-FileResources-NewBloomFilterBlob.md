---
title: "NewBloomFilterBlob | Go | v2"
slug: /go/go/v2-FileResources-NewBloomFilterBlob
sidebar_label: "NewBloomFilterBlob"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation builds a serialized stable Bloom filter blob from a membership set with the target false-positive rate, sized so large membership sets pass the proxy gRPC receive limit. | Go | v2"
type: docx
token: VTwWd4echo5yvmx4QhscJOvendh
sidebar_position: 4
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - NewBloomFilterBlob
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewBloomFilterBlob

This operation builds a serialized stable Bloom filter blob from a membership set with the target false-positive rate, sized so large membership sets pass the proxy gRPC receive limit. 

The blob feeds a `membership_match(field, {blob}, type=bloom)` filter expression; `members` accepts `[]int64` for integer fields or JSON paths, and string member sets use NewRoaringBitmapBlob().

```go
func NewBloomFilterBlob(members any, fpr float64) (BloomFilterBlob, error)
```

## Request Syntax\{#request-syntax}

Builds a Bloom filter blob from the given members with the given false-positive rate.

```go
NewBloomFilterBlob(members any, fpr float64) (BloomFilterBlob, error)
```

**RETURN TYPE:**

*(BloomFilterBlob, error)*

**RETURNS:**

Returns the serialized Bloom filter blob. Returns an error when members is not a supported membership set.

**PARAMETERS:**

- **blob** (*BloomFilterBlob*) -

    The serialized Bloom filter blob bytes referenced from the filter expression.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewBloomFilterBlob usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

blob, err := milvusclient.NewBloomFilterBlob([]int64{1, 2, 3}, 0.01)
if err != nil {
	// handle error
}

fmt.Println(len(blob))
```
