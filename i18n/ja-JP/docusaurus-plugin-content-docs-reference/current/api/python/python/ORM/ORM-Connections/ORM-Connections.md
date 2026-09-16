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
  - スパースベクトル
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

## コンストラクター\{#constructor}

すべての接続を管理するシングルトンインスタンスを構築します。 

<Admonition type="info" title="Notes">

このクラスの新しいインスタンスを自分で作成する代わりに、次の例に示すように既存のシングルトンインスタンスをインポートしてください。

</Admonition>

## 例\{#examples}

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

<Admonition type="info" title="Note">

クラスターの endpoint と token はどのように取得できますか？

- **クラスター endpoint**

    [Zilliz Cloud](https://cloud.zilliz.com) コンソールにログインし、左側のナビゲーションペインで **クラスター** をクリックします。クラスター一覧で対象クラスターの名前をクリックし、**Connect** エリアにある endpoint をコピーします。

- **Access token**

    Zilliz Cloud クラスターに接続するには、次のいずれかを使用できます。

    - API キー

        [Zilliz Cloud](https://cloud.zilliz.com) コンソールにログインし、左側のナビゲーションペインで **API Keys** をクリックします。

    - クラスターにアクセスするためのユーザー名とパスワードのペアを、コロン（**:**）で連結したもの。

        Zilliz Cloud コンソールでクラスター作成時に指定したクラスター認証情報、または既存の任意のクラスターユーザーの認証情報を使用できます。

</Admonition>

## メソッド\{#methods}

以下は、`connections` シングルトンインスタンスのメソッドです。
