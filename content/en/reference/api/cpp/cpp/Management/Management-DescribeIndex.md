---
title: "DescribeIndex() | Cloud"
slug: /cpp/cpp/Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets descriptions and parameters of the specified index. | Cloud"
type: docx
token: MW7cdYuPyoNF2wxD5oKcibgynKd
sidebar_position: 4
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

This operation gets descriptions and parameters of the specified index.

```c++
Status DescribeIndex(const DescribeIndexRequest& request, DescribeIndexResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DescribeIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name)
    .WithTimestamp(ts);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithFieldName(const std::string& field_name)`

    Sets the name of the field.

- `WithIndexName(const std::string& index_name)`

    Set the name of the index. 

    <Admonition type="info" icon="📘" title="Notes">

    If both the field name and the index name are specified, the index name will be used; otherwise, it falls back to the field name.

    </Admonition>

- `WithTimestamp(int64_t ts)`

    Sets a timestamp. If set, this operation only checks the segments generated before this timestamp; otherwise, all segments will be checked.

**RETURNS:**

*Status* with *DescribeIndexResponse*

Check `status.IsOk()` to confirm success.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DescribeIndexResponse desc_response;
status = client->DescribeIndex(milvus::DescribeIndexRequest()
                                        .WithDatabaseName(db_name)
                                        .WithCollectionName(collection_name)
                                        .WithIndexName(index_name),
                                    desc_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& desc : desc_response.Descs()) {
    std::cout << "\tIndexName: " << desc.IndexName() << std::endl;
    std::cout << "\tIndexType: " << std::to_string(desc.IndexType()) << std::endl;
    std::cout << "\tMetricType: " << std::to_string(desc.MetricType()) << std::endl;
    std::cout << "\tTotalRows: " << std::to_string(desc.TotalRows()) << std::endl;
    std::cout << "\tIndexedRows: " << std::to_string(desc.IndexedRows()) << std::endl;
    std::cout << "\tPendingRows: " << std::to_string(desc.PendingRows()) << std::endl;
}
```
