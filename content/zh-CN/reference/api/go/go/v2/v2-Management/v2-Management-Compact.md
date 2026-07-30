---
title: "Compact() | Go | v2"
slug: /go/v2-Management-Compact
sidebar_label: "Compact()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method compacts segments to improve search efficiency. | Go | v2"
type: origin
token: EPiVwFDR4iicrbkg50dcQYWsnMb
sidebar_position: 13
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Compact()

This method compacts segments to improve search efficiency. 

```go
func (c *Client) Compact(ctx context.Context, option CompactOption, callOptions ...grpc.CallOption) (int64, error)
```

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus automatically compacts segments at intervals. Unless you have set a clustering key in your collection, you should rely on automatic compactions.</p>

</Admonition>

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
     <td><p><code>option</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><a href="./v2-Management-Compact#compactoption"><code>GetLoadStateOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## CompactOption

This is an interface type. The `compactOption` struct type implements this interface type. 

You can use the `NewCompactOption()` function to get the concrete implementation.

### NewCompactOption()

The signature of this method is as follows:

```go
func NewCompactOption(collectionName string) *compactOption
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

`int64` (A compaction ID)

## Example

```go
import (
        "context"
        "github.com/milvus-io/milvus/client/v2/milvusclient"
)

compactID, err := cli.Compact(ctx, milvusclient.NewCompactOption("customized_setup_1"))
if err != nil {
    // handle err
}
fmt.Println(compactID)
// or GetCompactState ...
```
