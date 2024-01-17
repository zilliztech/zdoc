---
slug: /install-sdks
beta: FALSE
notebook: FALSE
token: J274wT61xiEM4fkYeL8cMb4Pnbd
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# Install SDKs

Discover how to seamlessly install Milvus SDKs, allowing efficient connections to Zilliz Cloud clusters.

## Overview{#overview}

Zilliz Cloud offers a managed Milvus vector database as a service. Four SDK options exist to facilitate cluster connections: [Python](./install-sdks#install-pymilvus-python-sdk), [Java](./install-sdks#install-java-sdk), [Go](./install-sdks#install-go-sdk), or [Node.js](./install-sdks#install-nodejs-sdk).

<Admonition type="info" icon="📘" title="Notes">

- Zilliz Cloud consistently upgrades clusters to ensure version compatibility. For details, visit the [Set up Maintenance Window](./setup-maintenance-window) page. If connection issues arise due to SDK version discrepancies, heed the provided prompts to revert to a compatible SDK version. We'll notify you post-maintenance, post which you can upgrade your SDK without concerns.

- All SDKs below offer both a stable version and a beta version. The stable version is intended for common clusters, while the beta version corresponds to beta clusters. If you have upgraded your clusters to the beta version, ensure that you also upgraded your SDKs to the beta version.

</Admonition>

## Install PyMilvus: Python SDK{#install-pymilvus-python-sdk}

PyMilvus is Milvus's Python SDK. Access its [source code on GitHub](https://github.com/milvus-io/pymilvus).

<Admonition type="info" icon="📘" title="Notes">

Ensure your **Python** version exceeds **3.7** prior to installation.

</Admonition>

```bash
# Install specific PyMilvus version for beta clusters
python -m pip install pymilvus==2.3.4

# Install specific PyMilvus version for common clusters
python -m pip install pymilvus==2.2.17

# Update PyMilvus to the newest version
python -m pip install --upgrade pymilvus

# Verify installation success
python -m pip list | grep pymilvus
```

## Install Node.js SDK{#install-nodejs-sdk}

For Milvus's Node.js SDK, employ **npm** or **yarn**. Access its [source code on GitHub](https://github.com/milvus-io/milvus-sdk-node).

<Admonition type="info" icon="📘" title="Notes">

Ensure your **Node.js** version is **14** or above prior to installation.

</Admonition>

```bash
# Installing a specific version for beta clusters
npm install @zilliz/milvus2-sdk-node@2.3.5
# Alternatively,
yarn add @zilliz/milvus2-sdk-node@2.3.5

# Installing a specific version for common clusters
npm install @zilliz/milvus2-sdk-node@2.2.24
# Alternatively,
yarn add @zilliz/milvus2-sdk-node@2.2.24

# Upgrade to the latest version
npm update @zilliz/milvus2-sdk-node
# Alternatively,
yarn upgrade @zilliz/milvus2-sdk-node

# Verify installation
npm list | grep @zilliz/milvus2-sdk-node
# or
yarn list | grep @zilliz/milvus2-sdk-node
```

You can use this SDK as either a CommonJS or an ES6 module. Typically, for `npm init` projects, use CommonJS. For `npm init es6` ones, ES6 is preferable.

```javascript
// Import the SDK as a CommonJS module
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Import the SDK as a ES6 module
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

## Install Java SDK{#install-java-sdk}

Use Apache Maven or Gradle/Grails to obtain the SDK. Access the [source code on GitHub](https://github.com/milvus-io/milvus-sdk-java).

- For Apache Maven, append this to the `pom.xml` dependencies:

```xml
<!-- Use this for beta clusters -->
<dependency>
     <groupId>io.milvus</groupId>
     <artifactId>milvus-sdk-java</artifactId>
     <version>2.3.3</version>
 </dependency>
 
 <!-- Use this for common clusters -->
 <dependency>
     <groupId>io.milvus</groupId>
     <artifactId>milvus-sdk-java</artifactId>
     <version>2.2.15</version>
 </dependency>
```

- For Gradle/Grails, execute:

```bash
# Use this for beta clusters
compile 'io.milvus:milvus-sdk-java:2.3.3'

# Use this for common clusters
compile 'io.milvus:milvus-sdk-java:2.2.15'
```

## Install Go SDK{#install-go-sdk}

The Go SDK is available via `go get`. Explore its [source code on GitHub](https://github.com/milvus-io/milvus-sdk-go).

```bash
# Run the following for beta clusters
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.3.3

# Run the following for common clusters
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.2.8
```

## Related topics{#related-topics}

- [Create Cluster](./create-cluster)

- [Create Collection](./create-collection)

- [Insert Entities](./insert-entities)

- [Search and Query](./search-query-and-get)

