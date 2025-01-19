---
slug: /go/v1-Connections-Close
beta: FALSE
notebook: FALSE
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

## Request Parameters{#request-parameters}

Null

## Return{#return}

Null

## Errors{#errors}

Any error in the execution of the request. Possible errors are as follows:

- `ErrClientNotReady`: The client is not connected to Milvus.

- The call to this API fails.

## Example{#example}

```go
mc.Close()
```
