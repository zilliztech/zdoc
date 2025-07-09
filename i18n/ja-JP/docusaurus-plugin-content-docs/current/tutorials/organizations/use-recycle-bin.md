---
title: "使用ごみ箱 | Cloud"
slug: /use-recycle-bin
sidebar_label: "使用ごみ箱"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのごみ箱機能は、意図的にまたはトライアルの期限切れやサービスの停止の結果として削除されたすべてのサーバーレスおよび専用クラスターの記録を保持することにより、データを保護します。気が変わった場合や誤ってクラスターを削除した場合、ごみ箱はクラスターの復元のための30日間の猶予期間を提供します。 | Cloud"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - recycle bin
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


# 使用ごみ箱

Zilliz Cloudのごみ箱機能は、意図的にまたはトライアルの期限切れやサービスの停止の結果として削除されたすべてのサーバーレスおよび専用クラスターの記録を保持することにより、データを保護します。気が変わった場合や誤ってクラスターを削除した場合、ごみ箱はクラスターの復元のための30日間の猶予期間を提供します。

ごみ箱を使用するには、**組織オーナー**である必要があります。

## 前提条件{#prerequisites}

ごみ箱にクラスタを復元するには、[支払い方法を追加する](/docs/payment-billing). 

</exclude>

## ごみ箱に落ちたクラスタを復元する{#restore-a-dropped-cluster-in-the-recycle-bin}

1. 削除されたクラスタが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから**ごみ箱**にアクセスしてください。

1. 復元するクラスタを見つけます。**アクション**ドロップダウンから、**クラスタの復元**を選択します。

1. 復元されたクラスタを構成します。

    1. この組織の別のプロジェクトにクラスターを復元できますが、別のクラウドリージョンには復元できません。

    1. クラスターの名前を変更し、接続の体格とパスワードをリセットできます。

    1. 復元されたクラスターに8個以上のCUがある場合は、レプリカの数を1から10の間で構成するオプションがあります。

    </include>

    <Admonition type="info" icon="📘" title="ノート">

    <p>クラスタ内のコレクションの負荷状態は保持されます。</p>

    </Admonition>

1. **リストア**をクリックします。Zilliz Cloudは指定された属性を持つクラスタの作成を開始し、作成したクラスタにデータをリストアします。

1. 新しい復元ジョブが生成されます。[仕事](./job-center)ページでクラスタの復元の進捗状況を確認できます。ジョブの状態が**IN PROGRESS**から**SUCCESS FUL**に切り替わると、復元が完了します。

![use-recycle-bin](/img/use-recycle-bin.png)

</exclude>

![byoc-use-recycle-bin](/img/byoc-use-recycle-bin.png)

</include>

