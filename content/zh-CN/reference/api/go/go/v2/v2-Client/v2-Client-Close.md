---
title: "Close() | Go | v2"
slug: /go/v2-Client-Close
sidebar_label: "Close()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method closes the currently connected Milvus deployment. | Go | v2"
type: origin
token: UNv5w9Mf5iTsbBkBIaTcimNCnuu
sidebar_position: 2
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Close()

This method closes the currently connected Milvus deployment.

```go
func (c *Client) Close(ctx context.Context) error
```

## Request Parameters

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>ctx</code></p></td>
     <td><p>Context for the current call to work.</p></td>
     <td><p><code>context.Context</code></p></td>
   </tr>
</table>

## Return

Null

## Example

```go
import (
   "context"
   "github.com/milvus-io/milvus/v2/milvusclient"
)

// user cluster username and password
mclient, err := client.New(context.Background(), client.Config{
   Address: "YOUR_CLUSTER_ENDPOINT",
   Username: "YOUR_USERNAME",
   Password: "YOUR_PASSWORD"
})

// or use an API key with appropriate permissions
// client, err := client.New(context.Background(), client.Config{
//    Address: "YOUR_CLUSTER_ENDPOINT",
//    APIKey: "YOUR_API_KEY",
//    EnableTLSAuth: true,
// })

mclient.close()
```

