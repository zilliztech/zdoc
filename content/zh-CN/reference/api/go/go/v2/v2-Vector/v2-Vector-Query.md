---
title: "Query() | Go | v2"
slug: /go/v2-Vector-Query
sidebar_label: "Query()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method performs a scalar-filtering query. | Go | v2"
type: origin
token: PFegwz4zQiBs69khRm2cr70knQd
sidebar_position: 6
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Query()

This method performs a scalar-filtering query.

```go
func (c *Client) Query(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
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
     <td><p><a href="./v2-Vector-Query#queryoption"><code>QueryOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOptions</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## QueryOption

This is an interface type. The `queryOption` struct types implement this interface type. 

You can use the `NewQueryOption` function to get the concrete implementation.

### NewQueryOption

The signature of this method is as follows:

```go
func NewQueryOption(collectionName string) *queryOption
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

## ResultSet

This is a struct type. You can use the `GetColumn` method to get the result values in a specific field.

### GetColumn

This method returns the query result in a specific column. The signature is as follows:

```go
func (rs *ResultSet) GetColumn(fieldName string) column.Column
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>fieldName</code></p></td>
     <td><p>Name of the target field.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

`ResultSet`

## Example

```plaintext
rs, err := cli.Query(ctx, milvusclient.NewQueryOption("quick_setup").
    WithFilter("emb_type == 3").
    WithOutputFields("id", "emb_type"))
if err != nil {
    // handle error
}

fmt.Println(rs.GetColumn("id"))
```

