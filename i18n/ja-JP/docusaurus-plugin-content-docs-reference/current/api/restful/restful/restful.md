---
displayed_sidbar: restfulSidebar
slug: /restful
title: RESTful API の概要
description: Zilliz Cloud は、cluster、collection、およびその中に保存されたデータを操作するための RESTful API を提供しています。
beta: FALSE
notebook: FALSE
sidebar_label: RESTful API リファレンス
sidebar_position: 0
keywords: 
    - zilliz cloud
    - zilliz
    - cloud
    - api
    - restful
    - 概要
---

import Admonition from '@theme/Admonition';


# RESTful API の概要

Zilliz Cloud は、cluster、collection、およびその中に保存されたデータを操作するための RESTful API を提供しています。 

Zilliz Cloud では、control plane を使用して clusters と関連リソースの管理を一元化し、一方で data plane は特定の collection 内のデータ保存と処理を担当します。

## Control Plane API

- Control Plane API を使用する場合、リクエストの認証には **有効な API key** を使用する必要があります。

    以下は、利用可能なすべてのクラウドプロバイダーを一覧表示する例です。

    ```shell
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    curl --request GET \
        --url "https://api.cloud.zilliz.com/v2/clouds" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json"
    ```

## Data Plane API

- Data Plane API を使用する場合、リクエストの認証には **有効な API key または有効な cluster username と password の組み合わせのいずれか** を使用できます。

    以下は、指定した cluster 内の利用可能なすべての collections を一覧表示する例です。

    ```shell
    export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
    export TOKEN="db_admin:xxxxxxxxxxxx"

    curl --request GET \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "accept: application/json" \
        --header "content-type: application/json" \
        -d '{}'
    ```
