---
displayed_sidbar: restfulSidebar
slug: /restful-versioning
title: RESTful API Versioning
description: This page describes the versioning scheme used by Zilliz Cloud RESTful APIs.
beta: FALSE
notebook: FALSE
sidebar_label: API Versioning
sidebar_position: 0
---

import Admonition from '@theme/Admonition';

# RESTful API Versioning

Zilliz Cloud RESTful APIs 提供多个版本以保证 API 的稳定性和兼容性。 

The versioning is implemented using the URL path versioning scheme, where the version number is included in the URL path. 

For example, the V2 version of the API endpoint for listing all the available clouds can be accessed using the following URL:

```
https://api.cloud.zilliz.com.cn/v2/clouds
```

And the V2 version of the API endpoint for creating a new collection can be accessed using the following URL:

```
https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create
```

You are advised to use the **V2 Version** of these API endpoints, and new features and improvements will be added to the V2 version later on. The V1 version will be deprecated soon.
