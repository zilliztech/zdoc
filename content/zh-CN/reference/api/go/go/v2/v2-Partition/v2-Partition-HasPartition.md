---
title: "HasPartition() | Go | v2"
slug: /go/v2-Partition-HasPartition
sidebar_label: "HasPartition()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method checks whether the specified partition exists. | Go | v2"
type: origin
token: YDDBwm1kfiAdPvkKXprcwbAxnzc
sidebar_position: 4
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HasPartition()

This method checks whether the specified partition exists.

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
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
     <td><p><code>option</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><a href="./v2-Partition-HasPartition#haspartitionoption"><code>HasPartitionOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## HasPartitionOption

This is an interface type. The `hasPartitionOption` struct type implements this interface type. 

You can use the `NewHasPartitionOption()` function to get the concrete implementation.

### NewHasCollectionOption

The signature of this method is as follows:

```go
func NewHasCollectionOption(name string) HasCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the collection to check.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

`bool`

## Example

```go
import (
        "context"
        "github.com/milvus-io/milvus/client/v2/milvusclient"
)

result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
    // handle error
}

fmt.Println(result)
```

