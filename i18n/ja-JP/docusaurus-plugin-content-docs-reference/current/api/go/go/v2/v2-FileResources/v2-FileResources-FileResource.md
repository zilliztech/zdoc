---
title: "FileResource | Go | v2"
slug: /go/go/v2-FileResources-FileResource
sidebar_label: "FileResource"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FileResource インスタンスは、システム内のファイルリソースを表し、ListFileResources によって返されます。 | Go | v2"
type: docx
token: FyjHdFDWBolmHNxYQ5rcGunqn6d
sidebar_position: 2
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - cloud
  - FileResource
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# FileResource

FileResource インスタンスは、システム内のファイルリソースを表します。このインスタンスは ListFileResources によって返されます。

```go
type FileResource struct {
    ID int64
    Name string
    Path string
}
```

**フィールド:**

- **ID** (*int64*) -

    ファイルリソースの一意の識別子です。

- **Name** (*string*) -

    ファイルリソースの名前です。

- **Path** (*string*) -

    ファイルリソースのパスです。

## 例\{#example}

FileResource の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

resources, err := cli.ListFileResources(ctx, milvusclient.NewListFileResourcesOption())
if err != nil {
	// handle error
}

for _, resource := range resources {
	fmt.Println(resource.ID, resource.Name, resource.Path)
}
if err != nil {
	// handle error
}
```
