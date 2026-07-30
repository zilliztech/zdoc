---
displayed_sidbar: restfulSidebar
slug: /restful-versioning
title: RESTful API Versioning
description: This page describes the versioning scheme used by Zilliz Cloud RESTful APIs.
beta: FALSE
notebook: FALSE
sidebar_label: API Versioning
sidebar_position: 0
keywords: 
    - zilliz cloud
    - zilliz
    - cloud
    - restful
    - api
    - versioning
---

import Admonition from '@theme/Admonition';

# RESTful API Versioning

Zilliz Cloud RESTful APIs are versioned to ensure the stability and compatibility of the API endpoints. 

The versioning is implemented using the URL path versioning scheme, where the version number is included in the URL path. 

For example, the V2 version of the API endpoint for listing all the available clouds can be accessed using the following URL:

```
https://api.cloud.zilliz.com/v2/clouds
```

And the V2 version of the API endpoint for creating a new collection can be accessed using the following URL:

```
https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create
```

You are advised to use the **V2 Version** of these API endpoints, and new features and improvements will be added to the V2 version later on. The V1 version will be deprecated soon.
