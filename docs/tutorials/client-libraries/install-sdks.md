---
title: "Install SDKs | Cloud"
slug: /install-sdks
sidebar_label: "Install SDKs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers a managed Milvus vector database as a service. Four SDK options exist to facilitate cluster connections Python](./install-sdks#install-pymilvus-python-sdk), [Java](./install-sdks#install-java-sdk), [Go](./install-sdks#install-go-sdk), or [Node.js. | Cloud"
type: origin
token: J274wT61xiEM4fkYeL8cMb4Pnbd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Install SDKs

Zilliz Cloud offers a managed Milvus vector database as a service. Four SDK options exist to facilitate cluster connections: [Python](./install-sdks#install-pymilvus-python-sdk), [Java](./install-sdks#install-java-sdk), [Go](./install-sdks#install-go-sdk), or [Node.js](./install-sdks#install-nodejs-sdk).

<Admonition type="info" icon="📘" title="Notes">

- Zilliz Cloud consistently upgrades clusters to ensure version compatibility. For details, visit the [Manage Organization Settings](./organization-settings) page. If connection issues arise due to SDK version discrepancies, heed the provided prompts to revert to a compatible SDK version. We'll notify you post-maintenance, post which you can upgrade your SDK without concerns.

- All SDKs below offer both a stable version and a beta version. The stable version is intended for common clusters, while the beta version corresponds to beta clusters. If you have upgraded your clusters to the beta version, ensure that you also upgraded your SDKs to the beta version.

</Admonition>

## SDK Compatibility\{#sdk-compatibility}

The following table lists the compatible SDK versions of each Milvus version.

| **Milvus Version** | **Python SDK** | **Node.js SDK** | **Java SDK** | **Go SDK** |
| --- | --- | --- | --- | --- |
| `2.6.x` | `2.6.9` | `2.6.10` | `2.6.14` | `2.6.2` |
| `2.5.x` | `2.5.18` | `2.5.13` | `2.5.15` | `2.5.6` |

## Install PyMilvus: Python SDK\{#install-pymilvus-python-sdk}

PyMilvus is Milvus's Python SDK. Access its [source code on GitHub](https://github.com/milvus-io/pymilvus).

<Admonition type="info" icon="📘" title="Notes">

Ensure your **Python** version exceeds **3.8** prior to installation.

</Admonition>

```bash
# Install pymilvus compatible with Milvus v2.5.x
python -m pip install pymilvus==2.5.18

# Update PyMilvus to the newest version
python -m pip install --upgrade pymilvus

# Verify installation success
python -m pip list | grep pymilvus
```

If your cluster is compatible with **Milvus v2.6.x (Public Preview),** please change `2.5.18` in the above commands to `2.6.9`.

## Install Node.js SDK\{#install-nodejs-sdk}

For Milvus's Node.js SDK, employ **npm** or **yarn**. Access its [source code on GitHub](https://github.com/milvus-io/milvus-sdk-node).

<Admonition type="info" icon="📘" title="Notes">

Ensure your **Node.js** version is **14** or above prior to installation.

</Admonition>

```bash
# Install Node.js SDK compatible with Milvus v2.5.x
npm install @zilliz/milvus2-sdk-node@2.5.13
# Alternatively,
yarn add @zilliz/milvus2-sdk-node@2.5.13

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

If your cluster is compatible with **Milvus v2.6.x (Public Preview),** please change `2.5.13` in the above commands to `2.6.10`.

## Install Java SDK\{#install-java-sdk}

Use Apache Maven or Gradle/Grails to obtain the SDK. Access the [source code on GitHub](https://github.com/milvus-io/milvus-sdk-java).

- For Apache Maven, append this to the `pom.xml` dependencies:

    ```xml
    <!-- Install Java SDK compatible with Milvus v2.5.x -->
    &lt;dependency&gt;
         <groupId>io.milvus</groupId>
         <artifactId>milvus-sdk-java</artifactId>
         &lt;version&gt;2.5.15&lt;/version&gt;
     &lt;/dependency&gt;
    ```

- For Gradle/Grails, execute:

    ```bash
    # Install Java SDK compatible with Milvus v2.5.x
    compile 'io.milvus:milvus-sdk-java:2.5.15'
    ```

If your cluster is compatible with **Milvus v2.6.x (Public Preview),** please change `2.5.15` in the above commands to `2.6.14`.

## Install Go SDK\{#install-go-sdk}

The Go SDK is available via `go get`. Explore its [source code on GitHub](https://github.com/milvus-io/milvus-sdk-go).

```bash
# Install Go SDK compatible with Milvus v2.5.x
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.5.6
```

If your cluster is compatible with **Milvus v2.6.x (Public Preview),** please change `2.5.6` in the above commands to `2.6.1`.