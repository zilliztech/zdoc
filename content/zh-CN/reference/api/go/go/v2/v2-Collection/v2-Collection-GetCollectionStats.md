---
title: "GetCollectionStats() | Go | v2"
slug: /go/v2-Collection-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method collects the statistics on the specified collections. | Go | v2"
type: origin
token: CFBVw8mkOimkUzkZhwFclTjqnge
sidebar_position: 17
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

This method collects the statistics on the specified collections.

```go
func (c *Client) GetCollectionStats(ctx context.Context, opt GetCollectionOption) (map[string]string, error)
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
   <tr>
     <td><p><code>opt</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><a href="./v2-Collection-GetCollectionStats#getcollectionoption"><code>GetCollectionOption</code></a></p></td>
   </tr>
</table>

## GetCollectionOption

This is an interface type. The `getCollectionStatsOption` struct type implements this interface type. 

You can use the `NewGetCollectionStatsOption()` function to get the concrete implementation.

### NewGetCollectionStatsOption

The signature of this method is as follows:

```go
func NewGetCollectionStatsOption(collectionName string) *getCollectionStatsOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>collectionName</code></p></td>
     <td><p>Name of the target collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

`map[string]string`

## Example

```go
import (
        "context"
        "github.com/milvus-io/milvus/client/v2/milvusclient"
)

stats, err := cli.GetCollectionStats(ctx, milvusclient.NewGetCollectionStatsOption("quick_setup"))
if err != nil {
    // handle err
}
fmt.Println(stats)
```

