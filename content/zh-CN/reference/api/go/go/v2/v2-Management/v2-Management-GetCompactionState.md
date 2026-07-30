---
title: "GetCompactionState() | Go | v2"
slug: /go/v2-Management-GetCompactionState
sidebar_label: "GetCompactionState()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method compacts segments to improve search efficiency. | Go | v2"
type: origin
token: LsC0whs7xiVDnckI4l1c13IKnHd
sidebar_position: 14
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetCompactionState()

This method compacts segments to improve search efficiency. 

```go
func (c *Client) GetCompactionState(ctx context.Context, option GetCompactionStateOption, callOptions ...grpc.CallOption) (entity.CompactionState, error)
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
     <td><p><a href="./v2-Management-GetCompactionState#getcompactstateoption"><code>GetCompactStateOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## GetCompactStateOption

This is an interface type. The `getCompactStateOption` struct type implements this interface type. 

You can use the `NewGetCompactStateOption()` function to get the concrete implementation.

### NewGetCompactStateOption()

The signature of this method is as follows:

```go
func NewGetCompactionStateOption(compactionID int64) *getCompactionStateOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>compactionID</code></p></td>
     <td><p>ID of a compaction task, which is the value that the <a href="./v2-Management-Compact"><code>compact()</code></a> method returns.</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
</table>

## entity.CompactionState

The `entity.CompactionState` is a private enum type and has the following possible values.

```go
const (
    CompactionStateRunning   CompactionState = CompactionState(commonpb.CompactionState_Executing)
    CompactionStateCompleted CompactionState = CompactionState(commonpb.CompactionState_Completed)
)
```

## Return

`entity.CompactionState`

## Example

```go
import (
        "context"
        "github.com/milvus-io/milvus/client/v2/milvusclient"
)

state, err := cli.GetCompactionState(ctx, milvusclient.NewGetCompactionStateOption(compactID))
if err != nil {
    // handle err
}
fmt.Println(state)
```
