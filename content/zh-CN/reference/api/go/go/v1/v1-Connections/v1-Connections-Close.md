---
title: "Close() | Go | v1"
slug: /go/v1-Connections-Close
sidebar_label: "Close()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "This method closes the connection to Milvus. | Go | v1"
type: origin
token: OSL8wYeC2iSUpqk6kV7cWhzynIR
sidebar_position: 2
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Close()

This method closes the connection to Milvus.

```go
func (c *GrpcClient) Close() error
```

## Request Parameters

Null

## Return

Null

## Errors

Any error in the execution of the request. Possible errors are as follows:

- `ErrClientNotReady`: The client is not connected to Milvus.

- The call to this API fails.

## Example

```go
mc.Close()
```
