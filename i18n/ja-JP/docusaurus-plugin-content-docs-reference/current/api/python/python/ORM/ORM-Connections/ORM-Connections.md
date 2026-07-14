---
title: "Connections | Python | ORM"
slug: /python/python/ORM-Connections
sidebar_label: "Connections"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Connections インスタンスは、Zilliz Cloud クラスターへの接続プールを表します。 | Python | ORM"
type: docx
token: A96udk9seoF5x5xywQZcLasanIe
sidebar_position: 3
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - Connections
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Connections

**Connections** インスタンスは、Zilliz Cloud クラスターへの接続プールを表します。

```python
class pymilvus.Connections
```

## Constructor\{#constructor}

すべての接続を管理するシングルトンインスタンスを構築します。 

<Admonition type="info" icon="📘" title="Notes">

このクラスの新しいインスタンスを自分で作成する代わりに、次の例に示すように既存のシングルトンインスタンスをインポートしてください。

</Admonition>

## Examples\{#examples}

```python
from pymilvus import connections    

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_TOKEN"

# Establish a connection
connections.connect(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
) 
```

<Admonition type="info" icon="📘" title="Note">

cluster endpoint と token はどのように取得できますか？

- **Cluster endpoint**

    [Zilliz Cloud](https://cloud.zilliz.com) コンソールにログインし、左側のナビゲーションペインで **Clusters** をクリックします。クラスター一覧で対象クラスターの名前をクリックし、**Connect** エリアにある endpoint をコピーできます。

- **Access token**

    Zilliz Cloud クラスターに接続するには、次のいずれかを使用できます。

    - API key

        [Zilliz Cloud](https://cloud.zilliz.com) コンソールにログインし、左側のナビゲーションペインで **API Keys** をクリックします。

    - コロン（**:**）で連結した username と password のペア

        Zilliz Cloud コンソールでクラスター作成時に指定したクラスター認証情報、または既存の任意のクラスターユーザーの認証情報を使用できます。

</Admonition>

## Methods\{#methods}

以下は、`connections` シングルトンインスタンスのメソッドです。
