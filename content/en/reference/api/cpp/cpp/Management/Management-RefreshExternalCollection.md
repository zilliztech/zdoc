---
title: "RefreshExternalCollection() | Cloud"
slug: /cpp/cpp/Management-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation starts a refresh job for an external collection. Use it after external data changes and the collection metadata needs to be refreshed. | Cloud"
type: docx
token: BRFNded7LoGTfJxgz9kcq20Vnmg
sidebar_position: 25
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

This operation starts a refresh job for an external collection. Use it after external data changes and the collection metadata needs to be refreshed.

```c++
Status RefreshExternalCollection(const RefreshExternalCollectionRequest& request, RefreshExternalCollectionResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::RefreshExternalCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the external collection to refresh.

- `WithExternalSource(const std::string& external_source)`

    Sets the external source URI.

    Provide `external_source` and `external_spec` together, or omit both; when both are omitted, the refresh reuses the persisted source and spec.

    On Zilliz Cloud, `external_source` accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. For a `volume://` URI, the rule above applies. For a `milvus://` source, the same rule applies — omitting it reuses the persisted source, and the refresh still syncs the latest data.

- `WithExternalSpec(const nlohmann::json& external_spec)`

    Sets the external source specifications as JSON, such as `format`. Possible `format` values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

    On Zilliz Cloud, `milvus-table` sources are used with the `milvus://` scheme; `format` can be omitted and defaults to `milvus-table` for a `milvus://` source.

**RETURNS:**

*Status*

**EXCEPTIONS:**

- **std::exception**

    This exception can be raised if the request cannot be sent or the response cannot be parsed.

## Example\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
milvus::RefreshExternalCollectionResponse response;
status = client->RefreshExternalCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
