---
title: "CreateDatabase() | Go | v2"
slug: /go/v2-Database-CreateDatabase
sidebar_label: "CreateDatabase()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method creates a database. | Go | v2"
type: origin
token: SviiwG5mniOJAVk2NRocHm5pnUc
sidebar_position: 3
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateDatabase()

This method creates a database.

```go
func (c *Client) CreateDatabase(ctx context.Context, option CreateDatabaseOption, callOptions ...grpc.CallOption) error
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
     <td><p><a href="./v2-Database-CreateDatabase#createdatabaseoption"><code>CreateDatabaseOption</code></a></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## CreateDatabaseOption

This is an interface type. The `createDatabaseOption` struct type implements this interface type. 

You can use the `NewCreateDatabaseOption()` function to get the concrete implementation.

### NewCreateDatabaseOption

The signature of this method is as follows:

```go
func NewCreateDatabaseOption(dbName string) *createDatabaseOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>dbName</code></p></td>
     <td><p>Name of the database to create.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## Return

Null

## Example

```plaintext
dbName := `test_db`
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle err
}

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption(dbName))
if err != nil {
    // handle err
}
```
