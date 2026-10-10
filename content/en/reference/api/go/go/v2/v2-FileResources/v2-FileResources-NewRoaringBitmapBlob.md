---
title: "NewRoaringBitmapBlob | Go | v2"
slug: /go/go/v2-FileResources-NewRoaringBitmapBlob
sidebar_label: "NewRoaringBitmapBlob"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation builds a serialized roaring bitmap blob from a membership set. The blob feeds a membershipmatch(field, \\{blob\\}, type=roaring) filter expression. | Go | v2"
type: docx
token: O8dIdQuMyofLmVxGXYScUSK0nOe
sidebar_position: 5
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - NewRoaringBitmapBlob
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewRoaringBitmapBlob

This operation builds a serialized roaring bitmap blob from a membership set. The blob feeds a membership_match(field, \{blob\}, type=roaring) filter expression.

```go
func NewRoaringBitmapBlob(members any) (RoaringBitmapBlob, error)
```

## Request Syntax\{#request-syntax}

Builds a roaring bitmap blob from the given members.

```go
NewRoaringBitmapBlob(members any) (RoaringBitmapBlob, error)
```

**RETURN TYPE:**

*(RoaringBitmapBlob, error)*

**RETURNS:**

Returns the serialized roaring bitmap blob. Returns an error when members is not a supported membership set.

**PARAMETERS:**

- **blob** (*RoaringBitmapBlob*) -

    The serialized roaring bitmap blob bytes referenced from the filter expression.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewRoaringBitmapBlob usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

blob, err := milvusclient.NewRoaringBitmapBlob([]string{"user-a", "user-b"})
if err != nil {
	// handle error
}

fmt.Println(len(blob))
```
