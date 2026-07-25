---
title: "GetImportProgress() | Go | v2"
slug: /go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This operation gets the progress of the specified bulk-import job. | Go | v2"
type: origin
token: Dz6xwT8r7iKbHokJOhqc6uHpnwf
sidebar_position: 2
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetImportProgress()

This operation gets the progress of the specified bulk-import job.

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
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
     <td><p><a href="./v2-DataImport-GetImportProgress#getimportprogressoption"><code>GetImportProgressOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## GetImportProgressOption

This is a struct type. You can use `NewCloudGetImportProgressOption()` to get its concrete implementation.

## NewCloudGetImportProgressOption

The signature of `NewCloudGetImportProgressOption()` is as follows:

```go
func NewCloudGetImportProgressOption(uri string, jobID string, apiKey string, clusterID string) *GetImportProgressOption
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
     <td><p><code>jobID</code></p></td>
     <td><p>The ID of the target data import job.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>apiKey</code></p></td>
     <td><p>A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>clusterID</code></p></td>
     <td><p>The instance ID of the target cluster of this operation.</p><p>You can obtain the instance ID of a cluster from its details page in the Zilliz Cloud console.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

You can chain the following methods to append more parameters to the `BulkImportOption` struct.

- [WithAPIKey](./v2-DataImport-GetImportProgress#withapikey)

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

## grpc.CallOption

This interface provided by the gRPC Go library allows you to specify additional options or configurations when making requests. For possible implementations of this interface, refer to [this file](https://github.com/grpc/grpc-go/blob/v1.69.4/rpc_util.go#L174).

## GetImportProgressResponse

The `GetImportProgressResponse` struct type is as follows:

```go
type GetImportProgressResponse struct {
    Status  int    `json:"status"`
    Message string `json:"message"`     
    Data *ImportProgressData `json:"data"`
}
```

The struct type that appears in the `GetImportProgressResponse` struct type is as follows:

- [ImportProgressData](./v2-DataImport-GetImportProgress#importprogressdata)

## ImportProgressData

The `ImportProgressData` struct type is as follows:

```go
type ImportProgressData struct {
    CollectionName string                  `json:"collectionName"`
    JobID          string                  `json:"jobId"`
    CompleteTime   string                  `json:"completeTime"`
    State          string                  `json:"state"`
    Progress       int64                   `json:"progress"`
    ImportedRows   int64                   `json:"importedRows"`
    TotalRows      int64                   `json:"totalRows"`
    Reason         string                  `json:"reason"`
    FileSize       int64                   `json:"fileSize"`
    Details        []*ImportProgressDetail `json:"details"`
}
```

The struct type that appears in the `ImportProgressData` struct type is as follows:

- [ImportProgressDetail](./v2-DataImport-GetImportProgress#importprogressdetail)

## ImportProgressDetail

The `ImportProgressDetail` struct type is as follows:

```go
type ImportProgressDetail struct {
    FileName     string `json:"fileName"`
    FileSize     int64  `json:"fileSize"`
    Progress     int64  `json:"progress"`
    CompleteTime string `json:"completeTime"`
    State        string `json:"state"`
    ImportedRows int64  `json:"importedRows"`
    TotalRows    int64  `json:"totalRows"`
}
```

## Return

`*[GetImportProgressResponse`](./v2-DataImport-GetImportProgress#getimportprogressresponse)

## Example

```go

```

