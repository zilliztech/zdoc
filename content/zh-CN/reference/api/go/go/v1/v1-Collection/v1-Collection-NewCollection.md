---
title: "NewCollection() | Go | v1"
slug: /go/v1-Collection-NewCollection
sidebar_label: "NewCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "This method creates a collection in a Zilliz Cloud cluster. | Go | v1"
type: origin
token: ZK1RwhRhni11HokSVw5c5EoFnTf
sidebar_position: 1
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewCollection()

This method creates a collection in a Zilliz Cloud cluster.

```go
func (c *GrpcClient) NewCollection(ctx context.Context, collName string, dimension int64, opts ...CreateCollectionOption) error
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
     <td><p><code>collName</code></p></td>
     <td><p>Name of the collection to create.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>dimension</code></p></td>
     <td><p>Dimensionality of the vector field.</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
   <tr>
     <td><p><code>opts</code></p></td>
     <td><p>Extra options for the current request.</p><p>This parameter is optional. You can add multiple <code>CreateCollectionOption</code> in the request.</p></td>
     <td><p><code>...entity.CreateCollectionOption</code></p></td>
   </tr>
</table>

## entity.CreateCollectionOption

You can add extra collection settings to the `NewCollection()` request using the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>WithAutoID(autoID bool)</code></p></td>
     <td><p>Whether allows Zilliz Cloud to automatically generate IDs upon data insertions.</p></td>
   </tr>
   <tr>
     <td><p><code>WithMetricsType(mt entity.MetricType)</code></p></td>
     <td><p>Metric type for Zilliz Cloud to measure similarity between vector embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>WithPKFieldName(name string)</code></p></td>
     <td><p>Custom name of the primary field.</p><p>If not specified, the default value <code>id</code> applies.</p></td>
   </tr>
   <tr>
     <td><p><code>WithPKFieldType(tp entity.FieldType)</code></p></td>
     <td><p>Data type of the primary field.</p><p>If not specified, the default value entity <code>5</code> applies, indicating that the values in the primary field are of the <code>int64</code> type.</p></td>
   </tr>
   <tr>
     <td><p><code>WithPKMaxLength(maxLength int64)</code></p></td>
     <td><p>Maximum length of the values in the primary field.</p><p>This is required only when you set <code>tp</code> in <code>WithPKFieldType()</code> to <code>21</code>,  which indicates that the values in the primary field are of the <code>VarChar</code> type.</p></td>
   </tr>
   <tr>
     <td><p><code>WithVectorFieldName(name string)</code></p></td>
     <td><p>Custom name of the vector field.</p><p>If not specified, the default value <code>vector</code> applies.</p></td>
   </tr>
</table>

## Return

Null

## Errors

Any error in the execution of the request. Possible errors are as follows:

- `ErrClientNotReady`: The client is not connected to Milvus.

- A collection with the same name already exists.

- The call to this API fails.

## Example

```go
var collectionName = "test_01"
errNew := mc.NewCollection(context.Background(), collectionName, 768, client.WithConsistencyLevel(entity.ClBounded))
if errNew != nil {
   log.Fatal("failed to New collection:", errNew.Error())
}
```

