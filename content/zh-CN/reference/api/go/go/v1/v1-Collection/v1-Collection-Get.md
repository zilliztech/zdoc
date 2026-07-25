---
title: "Get() | Go | v1"
slug: /go/v1-Collection-Get
sidebar_label: "Get()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "This method gets entities by their IDs. | Go | v1"
type: origin
token: REdMwk23riBsP9kylsTcFfkgnVe
sidebar_position: 15
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Get()

This method gets entities by their IDs.

```go
func (c *GrpcClient) Get(ctx context.Context, collectionName string, ids entity.Column, opts ...GetOption) (ResultSet, error)
```

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
     <td><p><code>collectionName</code></p></td>
     <td><p>Name of a collection.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>ids</code></p></td>
     <td><p>Boolean expression for metadata filtering.</p><p>For details, refer to <a href="https://milvus.io/docs/boolean.md">Scalar Filtering Rules</a>.</p></td>
     <td><p><code>entity.Column</code></p></td>
   </tr>
   <tr>
     <td><p><code>opts</code></p></td>
     <td><p>Extra query options.</p><p>You can add multiple <code>client.GetOption</code> instances.</p></td>
     <td><p><code>...client.GetOption</code></p></td>
   </tr>
</table>

### client.GetOption

You can add extra settings to the `Get()` request using the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>GetWithOutputFields(outputFields ...string)</code></p></td>
     <td><p>Sets the names of fields to be included in the return.</p></td>
   </tr>
   <tr>
     <td><p><code>GetWithPartitions(partitionNames ...string)</code></p></td>
     <td><p>Restricts the query within the specified partitions.</p></td>
   </tr>
</table>

A `client.ResultSet`, which is a slice of `entity.Column`. 

### client.ResultSet

The `client.ResultSet` provides the following methods for you to manipulate the query results.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>GetColumn(fieldName string)</code></p></td>
     <td><p><code>entity.Column</code></p></td>
     <td><p>Return the column with the provided name.</p></td>
   </tr>
   <tr>
     <td><p><code>Len()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the number of entities in the query result.</p></td>
   </tr>
   <tr>
     <td><p><code>Slice(start, end int)</code></p></td>
     <td><p><code>client.ResultSet</code></p></td>
     <td><p>Return a slice of the query result.</p></td>
   </tr>
</table>

## Errors

Any error in the execution of the request. Possible errors are as follows:

- `ErrClientNotReady`: The client is not connected to Milvus.

- `ErrCollectionNotExists`: The collection with the specified name does not exist.

- The call to this API fails.

## Example

```go
// get
ids := entity.NewColumnInt64("id", []int64{10, 11, 12, 19})
queryRes, errQuery := mc.Get(context.Background(), collectionName, ids, client.GetWithOutputFields("varchar"))
if errQuery != nil {
   log.Fatal("failed to query collection:", errQuery.Error())
}
for _, res := range queryRes {
   log.Println(res.Name(), res.FieldData())
}
```

