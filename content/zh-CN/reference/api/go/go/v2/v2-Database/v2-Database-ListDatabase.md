---
title: "ListDatabase() | Go | v2"
slug: /go/v2-Database-ListDatabase
sidebar_label: "ListDatabase()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method returns a list of database names. | Go | v2"
type: origin
token: ZyFDwfAiUiwqPEk1qoPcdxMKnDg
sidebar_position: 6
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListDatabase()

This method returns a list of database names.

```go
func (c *Client) ListDatabase(ctx context.Context, option ListDatabaseOption, callOptions ...grpc.CallOption) (databaseNames []string, err error)
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
     <td><p><a href="./v2-Database-ListDatabase#listdatabaseoption"><code>ListDatabaseOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## ListDatabaseOption

This is an interface type. The `listDatabaseOption` struct type implements this interface type. 

You can use the `NewListDatabaseOption()` function to get the concrete implementation.

### NewListDatabaseOption

The signature of this method is as follows:

```go
func NewListDatabaseOption() *listDatabaseOption
```

The `entity.Database` struct type is as follows:

```go
type Database struct {
    Name       string
    Properties map[string]string
}
```

## Return

`[]string`

## Example

```go
dbNames, err := cli.ListDatabase(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
    // handle err
}
fmt.Println(dbNames)
```
