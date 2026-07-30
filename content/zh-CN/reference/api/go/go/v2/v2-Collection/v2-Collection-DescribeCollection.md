---
title: "DescribeCollection() | Go | v2"
slug: /go/v2-Collection-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method describes a collection by providing its detailed information. | Go | v2"
type: origin
token: NmRwwnWK6in8rNkk5iucAWBznOf
sidebar_position: 9
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeCollection()

This method describes a collection by providing its detailed information.

```go
func (c *Client) DescribeCollection(ctx context.Context, option DescribeCollectionOption, callOptions ...grpc.CallOption) (collection *entity.Collection, err error)
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
     <td><p><a href="./v2-Collection-DescribeCollection#describecollectionoption"><code>DescribeCollectionOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## DescribeCollectionOption

This is an interface type. The `describeCollectionOption` struct type implements this interface type. 

You can use the `NewDescribeCollectionOption()` function to get the concrete implementation.

### NewDescribeCollectionOption

The signature of this method is as follows:

```go
func NewDescribeCollectionOption(name string) *describeCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the target collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## entity.Collection

The `entity.Alias` struct type is as follows:

```go
type Collection struct {
    ID               int64           // collection id
    Name             string          // collection name
    Schema           *entity.Schema  // collection schema, with fields schema and primary key definition
    PhysicalChannels []string
    VirtualChannels  []string
    Loaded           bool
    ConsistencyLevel entity.ConsistencyLevel
    ShardNum         int32
    Properties       map[string]string
}
```

## entity.Schema

For details about this struct type, refer to [entity.Schema](./v2-Collection-CreateCollection).

## entity.ConsistencyLevel

For details about this enumeration, refer to [entity.ConsistencyLevel](./v2-Collection-CreateCollection).

## Return

`*entity.Collection`

## Example

```go
import (
        "context"
        "github.com/milvus-io/milvus/client/v2/milvusclient"
)

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
        // handle error
}

fmt.Println(collection)
```
