---
slug: /install-sdks
beta: FALSE
notebook: FALSE
sidebar_position: 3
---



# Install SDKs

This guide will show you how to install Milvus SDKs for connecting to Zilliz Cloud clusters.

Zilliz Cloud offers a managed Milvus vector database as a service. To connect to a cluster, you can install one of four available SDKs: [Python](./install-sdks#install-pymilvus-python-sdk), [Java](./install-sdks#install-java-sdk), [Go](./install-sdks#install-go-sdk), or [Node.js](./install-sdks#install-nodejs-sdk).

:::info Notes

At Zilliz Cloud, we regularly upgrade your clusters to their latest compatible version. If you need more information, please visit our [Set up Maintenance Window](./set-up-maintenance-window) page. If you cannot connect to your Zilliz Cloud cluster with the latest version of an SDK, follow the prompted messages to downgrade your SDK to a compatible version. You will receive an email from us when the maintenance is complete, and you can then safely upgrade your SDK.

:::

## Starter APIs v.s. Advanced APIs{#starter-apis-vs-advanced-apis}

The code examples in [Quick Start](./quick-start-1) demonstrate the starter APIs. On the other hand, the advanced APIs are used in the [Use Customized Schema](./undefined), [Enable Dynamic Schema](./enable-dynamic-schema), [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1), and [Use Partition Key](./use-partition-key) sections.

To put it simply, the starter API is ideal for quickly creating collections, with default values applied. After using the starter API to create a collection, only two fields: **id** and **vector**, will be available as the primary key and vector field, respectively. Dynamic schema is enabled by default, so any fields other than the primary key and vector field in your data will be dynamic fields for your convenience.

The advanced API provides complete control over your collection schema. You can define the attributes of each field in the collection, choose whether to enable dynamic schema, and select whether to enable partition key, among other options.

## Install PyMilvus: Python SDK{#install-pymilvus-python-sdk}

PyMilvus is a Python SDK of Milvus. You can find its source code on [GitHub](https://github.com/milvus-io/pymilvus).

:::info Notes

Before installing, ensure that your **Python** version is above **3.7**.

:::

- Install a specific version of PyMilvus.

```bash
python -m pip install pymilvus==2.2.15
```

- Upgrade PyMilvus to the latest version.

```bash
python -m pip install --upgrade pymilvus
```

- Check whether the installation succeeds, run

```bash
python -m pip list | grep pymilvus

# Output:
# pymilvus        2.2.15
```

## Install Node.js SDK{#install-nodejs-sdk}

To get started using the Milvus Node.js SDK, it is recommended that you use `npm` (Node package manager) or `yarn` to install the dependency in your project. You can find its source code on [GitHub](https://github.com/milvus-io/milvus-sdk-node).

:::info Notes

Before installing, ensure that your **Node.js** version is above **14**.

:::

- Install a specific version

```bash
npm install @zilliz/milvus2-sdk-node@2.2.23
# or ...
yarn add @zilliz/milvus2-sdk-node@2.2.23
```

- Upgrade to the latest version.

```bash
npm update @zilliz/milvus2-sdk-node
# or ...
yarn upgrade @zilliz/milvus2-sdk-node
```

- Check whether the installation succeeds, run

```bash
npm list | grep @zilliz/milvus2-sdk-node
# or
yarn list | grep @zilliz/milvus2-sdk-node

# Output
# └── @zilliz/milvus2-sdk-node@2.2.23
```

You can import the SDK into your project as either a CommonJS module or an ES6 module. Generally, if you initialize your project using `npm init`, you should use the SDK as a CommonJS module. If you initialize your project using `npm init es6`, you should use the SDK as an ES6 module.

```javascript
// Import the SDK as a CommonJS module
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Import the SDK as a ES6 module
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

## Install Java SDK{#install-java-sdk}

You can use Apache Maven or Gradle/Grails to download the SDK. Its source code is hosted on [GitHub](https://github.com/milvus-io/milvus-sdk-java).

- Apache Maven

- Simply add the following to the dependencies in `pom.xml`.

```xml
<dependency>
     <groupId>io.milvus</groupId>
     <artifactId>milvus-sdk-java</artifactId>
     <version>2.2.9</version>
 </dependency>
```

- Gradle/Grails

- Run the following in your shell.

```bash
compile 'io.milvus:milvus-sdk-java:2.2.7'
```

## Install Go SDK{#install-go-sdk}

You can install the Go SDK via `go get`. Its source code can be found on [GitHub](https://github.com/milvus-io/milvus-sdk-go).

```go
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.2.7
```

## Related topics{#related-topics}

- [Create Cluster](./create-cluster) 

- [Create Collection](./create-collection-2) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-and-query) 

