---
displayed_sidbar: restfulSidebar
slug: /restful-versioning
title: RESTful API バージョニング
description: このページでは、Zilliz Cloud RESTful API で使用されるバージョニング方式について説明します。
beta: FALSE
notebook: FALSE
sidebar_label: API バージョニング
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

# RESTful API バージョニング

Zilliz Cloud RESTful API は、API エンドポイントの安定性と互換性を確保するためにバージョニングされています。 

このバージョニングは URL パスのバージョニング方式で実装されており、バージョン番号が URL パスに含まれます。 

たとえば、利用可能なすべてのクラウドを一覧表示する API エンドポイントの V2 バージョンには、次の URL を使用してアクセスできます。

```
https://api.cloud.zilliz.com/v2/clouds
```

また、新しいコレクションを作成する API エンドポイントの V2 バージョンには、次の URL を使用してアクセスできます。

```
https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create
```

これらの API エンドポイントでは **V2 バージョン** を使用することを推奨します。今後、新機能と改善は V2 バージョンに追加されます。V1 バージョンはまもなく非推奨となります。
