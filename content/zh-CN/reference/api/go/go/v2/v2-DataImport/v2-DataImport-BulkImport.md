---
title: "BulkImport() | Go | v2"
slug: /go/v2-DataImport-BulkImport
sidebar_label: "BulkImport()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read Prepare Data Import. | Go | v2"
type: origin
token: QTYswzGpriCygYkAgCkcYPCqnzb
sidebar_position: 1
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BulkImport()

This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read [Prepare Data Import](/docs/prepare-data-import).

```go
func BulkImport(ctx context.Context, option *BulkImportOption) (*BulkImportResponse, error)
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
     <td><p><a href="./v2-DataImport-BulkImport#bulkimportoption"><code>BulkImportOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## BulkImportOption

This is a struct type. You can use `NewCloudBulkImportOption()` to get its concrete implementation.

### NewCloudBulkImportOption

The signature of `NewCloudBulkImportOption()` is as follows:

```go
func NewCloudBulkImportOption(uri string, collectionName string, apiKey string, objectURL string, clusterID string, accessKey string, secretKey string, ) *BulkImportOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>uri</code></p></td>
     <td><p>The endpoint URL of the Zilliz Cloud Data Plane, which should be one of the follows:</p><ul><li><p><code><i>http</i>s://api.cloud.zilliz.com</code></p></li><li><p><code>https://api.cloud.zilliz.com.cn</code></p></li></ul></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>collectionName</code></p></td>
     <td><p>The name of a collection in the target cluster of this operation.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>apiKey</code></p></td>
     <td><p>A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>objectURL</code></p></td>
     <td><p>The URL of your data files in one of your block storage buckets. The following are some examples of renowned block storage services:</p><ul><li><p>Google Cloud Storage</p><p><code>gs://&lt;bucket-name&gt;/&lt;object-path&gt;/</code></p></li><li><p>AWS S3</p><p><code>s3://&lt;bucket-name&gt;/&lt;object-path&gt;/</code></p><p>For details, refer to <a href="/docs/data-import-storage-options">Storage Options</a>.</p></li></ul></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>clusterID</code></p></td>
     <td><p>The instance ID of the target cluster of this operation.</p><p>You can obtain the instance ID of a cluster from its details page in the Zilliz Cloud console.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>accessKey</code></p></td>
     <td><p>The access key that is used to authenticate access to your data files.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>secretKey</code></p></td>
     <td><p>The secret key that is used to authenticate access to your data files.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

You can chain the following methods to append more parameters to the `BulkImportOption` struct.

- [WithAPIKey](./v2-DataImport-BulkImport#withapikey)

- [WithPartition](./v2-DataImport-BulkImport#withpartition)

- [WithOption](./v2-DataImport-BulkImport#withoption)

### WithAPIKey

This method appends your Zilliz Cloud API key to the `BulkImportOption` struct. The signature of the method is as follows:

```go
func (opt *BulkImportOption) WithAPIKey(key string) *BulkImportOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>key</code></p></td>
     <td><p>A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### WithPartition

This method specifies the name of the target partition to the `BulkImportOption` struct. The signature of the method is as follows:

```go
func (opt *BulkImportOption) WithPartition(partitionName string) *BulkImportOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>partitionName</code></p></td>
     <td><p>The name of the target partition of this operation.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### WithOption

This method appends extra options in key-value pairs to the `BulkImportOption` struct. The signature of the method is as follows:

```go
func (opt *BulkImportOption) WithOption(key, value string) *BulkImportOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>key</code></p></td>
     <td><p>An extra <code>BulkImportOption</code> key</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>value</code></p></td>
     <td><p>The value of the above extra key.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## grpc.CallOption

This interface provided by the gRPC Go library allows you to specify additional options or configurations when making requests. For possible implementations of this interface, refer to [this file](https://github.com/grpc/grpc-go/blob/v1.69.4/rpc_util.go#L174).

## BulkImportResponse

The `BulkImportResponse` struct type is as follows:

```go
type BulkImportResponse struct {
    Status  int    `json:"status"`
    Message string `json:"message"`      
    Data struct {
        JobID string `json:"jobId"`
    } `json:"data"`
}
```

## Return

`*[BulkImportResponse`](./v2-DataImport-BulkImport#bulkimportresponse)

## Example

```go

```

